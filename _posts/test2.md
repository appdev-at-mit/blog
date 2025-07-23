---
title: "an empty canvas to be filled"
tags: ["test", "example"]
excerpt: "This is a test post to demonstrate the structure of a markdown file."
author:
  name: "Jieruei Chang"
  id: "convolution"
date: 1970-01-01
---

This is a test post.

## Subheading

Here is some code:

```javascript
function preprocess() {
  // load image into OpenCV
  let src = cv.imread(PHOTO_ELEM);

  // convert to grayscale
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  // otsu thresholding
  let binary = new cv.Mat();
  cv.threshold(gray, binary, 150, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

  // morphological operations for cleanup and noise reduction
  let closed = new cv.Mat();
  let kernel = cv.Mat.ones(2, 2, cv.CV_8U);
  cv.morphologyEx(
    binary,
    closed,
    cv.MORPH_OPEN,
    kernel,
    new cv.Point(-1, -1),
    1,
    cv.BORDER_CONSTANT,
    cv.morphologyDefaultBorderValue(),
  );

  // display the processed image
  cv.imshow(PROCESSED_ELEM, closed);

  // save image to image element
  let data = PROCESSED_ELEM.toDataURL("image/png");
  PROCESSED_IMAGE_ELEM.src = data;

  src.delete();
  gray.delete();
  binary.delete();

  return closed;
}
```

## Another Subheading

I’d just like to interject for a moment. What you’re refering to as Linux, is in fact, GNU/Linux, or as I’ve recently taken to calling it, GNU plus Linux. Linux is not an operating system unto itself, but rather another free component of a fully functioning GNU system made useful by the GNU corelibs, shell utilities and vital system components comprising a full OS as defined by POSIX.

Many computer users run a modified version of the GNU system every day, without realizing it. Through a peculiar turn of events, the version of GNU which is widely used today is often called Linux, and many of its users are not aware that it is basically the GNU system, developed by the GNU Project.

There really is a Linux, and these people are using it, but it is just a part of the system they use. Linux is the kernel: the program in the system that allocates the machine’s resources to the other programs that you run. The kernel is an essential part of an operating system, but useless by itself; it can only function in the context of a complete operating system. Linux is normally used in combination with the GNU operating system: the whole system is basically GNU with Linux added, or GNU/Linux. All the so-called Linux distributions are really distributions of GNU/Linux!
