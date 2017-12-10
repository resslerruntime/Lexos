# ====== Host all the text definition =======
import re

# the word is a sequence (more than one) of non-space character
from typing import List

# this is private because we want regex composition to be as few as possible
# use if you need to use this regex,
# please consider using the function provided below instead
_WORD_REGEX_STR = r'\S+'

# the left boundary of a word is either the start of the passage or a space
# this is private because we want regex composition to be as few as possible
# use if you need to use this regex,
# please consider using the function provided below instead
_SINGLE_LEFT_WORD_BOUNDARY_REGEX_STR = r'^|\s'

# the right boundary of a word is either the end of the passage or a space
# this is private because we want regex composition to be as few as possible
# use if you need to use this regex,
# please consider using the function provided below instead
_SINGLE_RIGHT_WORD_BOUNDARY_REGEX_STR = r'\s|$'

# ============== compiled version ==================
# the compiled version of word regex
WORD_REGEX = re.compile(_WORD_REGEX_STR, re.UNICODE)


def get_all_words_in_text(text: str) -> List[str]:
    """Get all the words in a given text in the order that they appear.

    :param text: the text to get all the word from
    :return: a list of words in the order that they appear in text
    """
    # the `split` and `strip` method handles all kinds of white spaces
    # including the
    return text.strip().split()


def get_single_word_count_in_text(text: str, word: str) -> int:
    """Get the number of single word appear in text.

    :param text: the whole text to find the word
    :param word: the word to find in the whole text
    :return: the number of times the `word` appear in `text`
    """
    return get_all_words_in_text(text).count(word)
