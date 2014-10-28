import html5lib

with open("index.html") as f:
    tree = html5lib.parse(f)
    ns = tree.tag[1:].split("}")[0]
    notes_nodes = tree.findall(".//{{{ns}}}aside".format(ns=ns))
    texts = u""
    for node in notes_nodes:
        texts += u" ".join(node.itertext())

words = texts.split()
count = len(words)

lower_wpm = 100
upper_wpm = 180

print("{words} words, at least {lower} minutes, at most {upper} minutes"
      .format(words=count, lower=(count / upper_wpm),
              upper=(count / lower_wpm)))

