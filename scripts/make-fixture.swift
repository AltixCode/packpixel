import AppKit

// Product photos with deliberately awkward aspect ratios, so a correct
// "pad to exact preset dimensions" result is distinguishable from a plain
// resize. Each carries a coloured border, letting the verifier tell the padded
// background apart from the image content.
let specs: [(name: String, w: Int, h: Int, colour: NSColor)] = [
    ("wide",  1600, 600,  .systemBlue),
    ("tall",   600, 1600, .systemGreen),
    ("square", 900, 900,  .systemOrange),
]

for spec in specs {
    let image = NSImage(size: NSSize(width: spec.w, height: spec.h))
    image.lockFocus()

    spec.colour.setFill()
    NSRect(x: 0, y: 0, width: spec.w, height: spec.h).fill()

    // A white inset makes the content edges unambiguous in the output.
    NSColor.white.setFill()
    NSRect(x: 40, y: 40, width: spec.w - 80, height: spec.h - 80).fill()

    let label = "\(spec.w)x\(spec.h)"
    label.draw(at: NSPoint(x: 60, y: CGFloat(spec.h) / 2),
               withAttributes: [
                   .font: NSFont.boldSystemFont(ofSize: CGFloat(min(spec.w, spec.h)) / 8),
                   .foregroundColor: NSColor.black,
               ])

    image.unlockFocus()

    guard let tiff = image.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else {
        fatalError("could not encode \(spec.name)")
    }
    let path = "/tmp/packpixel-\(spec.name).png"
    try! png.write(to: URL(fileURLWithPath: path))
    print("wrote \(path) (\(spec.w)x\(spec.h))")
}
