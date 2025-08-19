---
title: "how to label all 40000 rooms in mit"
tags: ["mapit", "devblog"]
excerpt: "only losers outsource data annotation to developing countries"
author:
  name: "Jieruei Chang"
  id: "rei"
date: 2025-08-18
---

MapIT’s pitch is simple: a campus map, but with room-level resolution. You’d be able to figure out exactly where that lecture is, hyperoptimize your class movement schedule, and not get lost trying to find your first-year advisor’s office at the end of freshman year (oops).

We made MapIT’s user interface as straightforward as possible―there’s only one search box. But behind it is a surprisingly complex jenga pipeline of computer vision, SVG parsers, and optical character recognition that's necessary to pinpoint the location of every single MIT room. It’s not that theoretically difficult; MIT has floorplans available online. The slight issue is that there are a lot of them. There’s nearly a thousand floorplans. There’s over forty thousand rooms. Herein we document my (Jieruei’s) slow descent into insanity as they tried to annotate, digitize, and make sense of every last classroom, closet, and broom cupboard on campus.

## con-text-ualization

"Just run OCR on the floorplan," I hear you say. The reality is that all the lines and shapes and arcs in the floorplan create a surprisingly hostile environment for text recognition. In order to run OCR, we need some way of separating text from the rest of the geometry.

I experimented with geometry heuristics: detect long straight segments, classify near-horizontal or vertical lines, filter by aspect ratios, and erase everything that looks “architectural.” All of these ideas worked sometimes, but there were always edge cases. It would be too trigger-happy deleting SVG paths that it thought were part of the room layout and accidentally cut parts out of letters. It would be too conservative and leave a bunch of extra lines that messed with optical character recognition. I tried template matching using a set of predefined number and letter templates, but 1s look a lot like vertical lines. I tried morphological operations and contour detection, but text sometimes overlaps with the rest of the geometry.

In the end, I discovered that text is displayed slightly differently in SVG than the rest of the geometry. It's rendered with a slightly thicker stroke, and filtering by that solves the problem perfectly.

![10_5](https://github.com/user-attachments/assets/67006254-95e4-448a-a692-7886ad4bbbb4)


## rooms for thought

Once we've separated geometry from text, we can also do some fun things like run a connected components floodfill on the de-textified floorplan to isolate all the different rooms. I’m sure there’s an algorithm out there to calculate intersections between lines and to analyze polygon geometry to find connected regions, but my background is in computer vision and when all you have is an image processing hammer, everything looks like an OpenCV-shaped nail. The code that generated the image below actually renders the entire SVG into a PNG file, runs floodfill and contour detection, and then finally redraws those contours back into the original SVG.

<embed src="../img/room_hovers.svg" width="100%" height="500px" />

Hover over the image to see the contours. Right now, this is just a fun demo, but in the future we can use this to show room numbers and other information when you hover over a room.

## finding the k-means to annotate 40000 rooms

My first thought was to run some kind of entropy calculation or some kind of blob detection on a rendered image, because, you know, image processing hammer.  But we know how many rooms there are on each floor. There’s a directory that lists how many rooms each floor contains, and it seems to be (usually) accurate. We can run k-means clustering on every point referenced in the text svg, and hopefully that gives us a set of lines corresponding to every room label. We can render this tiny set of lines into an image to get something like this:

<img width="300" height="238" alt="cluster_638_1052" src="https://github.com/user-attachments/assets/25431426-2bd0-426e-9c02-249d4a6530a9" />

Tesseract OCR, with a custom whitelist, handles this amazingly well. As a final step, we cross-reference our detected rooms against the name listings in the  MIT Room Directory so that we can be sure that all the rooms we found are correct. The full OCR system is nowhere near perfect―I estimate that 90% of rooms are captured―but it’s almost always good enough.

## when the stars align
We now have the locations of every room in MIT, but how do we actually put it on the map? The next step is to align the floorplans with the map of MIT buildings, and transform the building-relative coordinates of each room into absolute latitude and longitude coordinates on the map. Calculating the orientation is not that difficult; the floorplans have a north arrow, and we can use that to rotate the floorplan correctly. The hard part is aligning the floorplan with the building outline on the map.

I tried some small experiments with ICP and other point cloud registration algorithms in order to align the floorplan to the building outline on the map, but it turns out that the building outlines are often not that accurate (and floorplans, especially those of upper floors or basements, often do not resemble the building outline at all). In the end, I decided that the most reliable way to align floorplans was to just do it manually. Every floor you see was painstakingly aligned by yours truly. After many hours of work, the data for MapIT is finally ready to be used. (Mostly. There's still a couple floors left.)

## bottom text
MapIT officially launches today, in time for MIT orientation. File bug reports to let us know if my parser algorithms missed your lab (sorry). Let us know if you're interested in helping out with the project, or if you have any ideas for features we can add.
