---
title: "looking back"
tags: ["history", "reflection"]
excerpt: "I can't believe we thought this was a good idea a hundred years ago."
author:
  name: "Jieruei Chang"
  id: "convolution"
date: 2125-07-23
---

Catastrophic interference, also known as catastrophic forgetting, is the tendency of an artificial neural network to abruptly and drastically forget previously learned information upon learning new information.[1][2]

Neural networks are an important part of the connectionist approach to cognitive science. The issue of catastrophic interference when modeling human memory with connectionist models was originally brought to the attention of the scientific community by research from McCloskey and Cohen (1989),[1] and Ratcliff (1990).[2] It is a radical manifestation of the 'sensitivity-stability' dilemma[3] or the 'stability-plasticity' dilemma.[4] Specifically, these problems refer to the challenge of making an artificial neural network that is sensitive to, but not disrupted by, new information.

```python
def conv_block(self, in_channels, out_channels):
    return nn.Sequential(
        nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
        nn.ReLU(inplace=True),
        nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
        nn.SiLU(inplace=True),
        nn.Dropout(p=self.dropout_rate),
    )

def upconv_block(self, in_channels, out_channels):
    return nn.Sequential(
        nn.ConvTranspose2d(in_channels, out_channels, kernel_size=2, stride=2),
        nn.SiLU(inplace=True),
        nn.Dropout(p=self.dropout_rate),
    )
```
