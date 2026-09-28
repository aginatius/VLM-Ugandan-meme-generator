import os

import torch
from PIL import Image
from torch.utils.data import Dataset


class UgandanMemeDataset(Dataset):
    def __init__(self, image_folder, captions_dict, vocabulary):
        self.image_folder = image_folder
        self.vocabulary = vocabulary
        self.image_filenames = list(captions_dict.keys())
        self.captions_dict = captions_dict

    def __len__(self):
        return len(self.image_filenames)

    def __getitem__(self, index):
        image_name = self.image_filenames[index]
        image_path = os.path.join(self.image_folder, image_name)
        image = Image.open(image_path).convert("RGB").resize((224, 224))
        caption = self.vocabulary.numericalize(self.captions_dict[image_name])
        return image, torch.tensor(caption)
