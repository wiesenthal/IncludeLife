inclusions = ["meditating", "exercise", "cold-exposure", "Hanging out with friends IRL", "taking in nature", "Reading", "tennis", "making videos", "Painting", "self-reflection/journaling", "dr k guide to meditation", "Wood-carving", "clubs", "writing", "making music", "Calling friends", "practicing Spanish", "Learning self-improvement systems", "effective altruism", "martial art", "Judaism", "saunas", "camping", "learning Hebrew/languages", "watching movies", "finance", "Learning knowledge/history", "dancing", "Learning completely new skills", "practicing writing right-handed", "watching tv", "Going to museums"]

alpha = 0.9

n = len(inclusions)
zipfs = []
total = 0
for i, inclusion in enumerate(inclusions):
    zipfs.append(1.0/((i+1)**alpha))
    total += 1.0/((i+1)**alpha)

expected_proportions = [x/total for x in zipfs]

for i, inc in enumerate(inclusions):
    inclusions[i] = {"name": inc, "expected_proportion": expected_proportions[i], "done_count": 0}

print(inclusions)