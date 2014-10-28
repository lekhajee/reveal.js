from __future__ import print_function

import html5lib
from collections import defaultdict

with open("index.html") as f:
    tree = html5lib.parse(f)
    ns = tree.tag[1:].split("}")[0]
    notes_nodes = tree.findall(".//{{{ns}}}aside".format(ns=ns))
    # texts = u""
    speakers = defaultdict(list)
    for node in notes_nodes:
        speaker = None
        for text in node.itertext():
            nodewords = text.split()
            if not nodewords:
                continue
            if speaker is None:
                if nodewords[0][-1] == ':':
                    speaker = nodewords[0][:-1]
                else:
                    print("no speaker:", nodewords)
            speakers[speaker].extend(nodewords[1:])

count = sum(len(value) for value in speakers.values())

lower_wpm = 100
upper_wpm = 180

print("{words} words, at least {lower} minutes, at most {upper} minutes"
      .format(words=count, lower=(count / upper_wpm),
              upper=(count / lower_wpm)))

for speaker in speakers:
    print(speaker, "says", len(speakers[speaker]))
