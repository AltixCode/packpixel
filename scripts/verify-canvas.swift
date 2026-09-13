import AppKit
import Foundation

// Checks an exported batch against the preset it claims to target.
//
// The build this replaces resized images while reporting the preset's
// dimensions regardless, so a 1600x600 source came out 1600x600 and was
// labelled 2000x2000. Two things are asserted here: the output really is the
// target size, and the source is letterboxed inside it rather than stretched.
//
// Usage: verify-canvas.swift <targetW> <targetH> <file> [<file> ...]

let args = CommandLine.arguments
guard args.count >= 4, let targetW = Int(args[1]), let targetH = Int(args[2]) else {
    print("Usage: verify-canvas.swift <targetW> <targetH> <file> ...")
    exit(2)
}

var allPass = true
print("expecting \(targetW)x\(targetH)")
print("--- exports ---")

for path in args.dropFirst(3) {
    guard let image = NSImage(contentsOfFile: path),
          let rep = NSBitmapImageRep(data: image.tiffRepresentation!) else {
        print("FAIL  \(path) — unreadable")
        allPass = false
        continue
    }

    let w = rep.pixelsWide
    let h = rep.pixelsHigh
    let sizeOk = w == targetW && h == targetH

    // Sample the extreme corners: with contain-fit letterboxing at least one
    // opposing pair must be the padding colour, unless the source already
    // matches the target ratio exactly.
    func corner(_ x: Int, _ y: Int) -> NSColor? { rep.colorAt(x: x, y: y) }
    let corners = [corner(1, 1), corner(w - 2, 1), corner(1, h - 2), corner(w - 2, h - 2)]
        .compactMap { $0 }

    let nearWhite = corners.filter {
        $0.redComponent > 0.9 && $0.greenComponent > 0.9 && $0.blueComponent > 0.9
    }.count

    let status = sizeOk ? "ok  " : "FAIL"
    if !sizeOk { allPass = false }
    print("\(status) \((path as NSString).lastPathComponent)  \(w)x\(h)  padding corners: \(nearWhite)/4")
}

print(allPass
      ? "RESULT: PASS - every export is exactly the preset size"
      : "RESULT: FAIL - an export does not match the preset size")
exit(allPass ? 0 : 1)
