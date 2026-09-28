import re
from collections import Counter


class UgandanMemeVocabulary:
    def __init__(self, freq_threshold=1):
        self.itos = {0: "<PAD>", 1: "<START>", 2: "<END>", 3: "<UNK>"}
        self.stoi = {value: key for key, value in self.itos.items()}
        self.freq_threshold = freq_threshold

    def clean_and_tokenize(self, text):
        clean_text = re.sub(r"[^a-zA-Z0-9\\s]", "", text.lower().strip())
        return clean_text.split()

    def build_vocabulary(self, captions_list):
        frequencies = Counter()
        for caption in captions_list:
            frequencies.update(self.clean_and_tokenize(caption))

        for word, count in frequencies.items():
            if count >= self.freq_threshold and word not in self.stoi:
                index = len(self.stoi)
                self.stoi[word] = index
                self.itos[index] = word

    def numericalize(self, text):
        tokens = self.clean_and_tokenize(text)
        return [self.stoi["<START>"]] + [
            self.stoi.get(token, self.stoi["<UNK>"]) for token in tokens
        ] + [self.stoi["<END>"]]
