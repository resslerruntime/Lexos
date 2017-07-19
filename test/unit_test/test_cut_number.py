from lexos.processors.prepare.cutter import split_keep_whitespace, \
    count_words, cut_by_number


class TestNumberCutHelpers:
    def test_split_keep_whitespace(self):
        assert split_keep_whitespace("Test string") == ["Test", " ", "string"]
        assert split_keep_whitespace("Test") == ["Test"]
        assert split_keep_whitespace("Test ") == ["Test", " ", ""]  # intended?
        assert split_keep_whitespace(" ") == ["", " ", ""]  # intended?
        assert split_keep_whitespace("") == [""]

    def test_count_words(self):
        assert count_words(["word", "word", " ", "not", "word"]) == 4
        assert count_words(['\n', '\t', ' ', '', '\u3000', "word"]) == 1
        assert count_words([""]) == 0


class TestCutByNumbers:
    def test_cut_by_number_normal(self):
        assert cut_by_number("Text", 1) == ["Text"]
        assert cut_by_number("This text has five words", 5) == \
               ["This ", "text ", "has ", "five ", "words"]
        assert cut_by_number("Odd number of words in this text", 6) == \
               ["Odd number ", "of ", "words ", "in ", "this ", "text"]
        assert cut_by_number("Almost enough words here but not quite", 4) == \
               ["Almost enough ", "words here ", "but not ", "quite"]

    def test_cut_by_number_spacing(self):
        assert cut_by_number("Hanging space ", 2) == ["Hanging ", "space "]
        assert cut_by_number("Other  whitespace\n is\tfine!\n\n", 4) == \
               ["Other  ", "whitespace\n ", "is\t", "fine!\n\n"]
        assert cut_by_number("     <-There are five spaces here", 20) == \
               ["     <-There ", "are ", "five ", "spaces ", "here"]

    def test_cut_by_number_lines(self):
        assert cut_by_number(
            "Latinisalanguagewithnospaces\nYoumayfindthisdifficulttoread!", 2)\
               == ["Latinisalanguagewithnospaces\n",
                   "Youmayfindthisdifficulttoread!"]
        assert cut_by_number("line\nline\nline\nline\nline", 2) == \
               ["line\nline\nline\n", "line\nline"]

    def test_cut_by_number_excess_chunks(self):
        assert cut_by_number("This text has too few words!", 10) == \
               ["This ", "text ", "has ", "too ", "few ", "words!"]
        assert cut_by_number("Safe!", 1000) == ["Safe!"]
        assert cut_by_number("RemovewhitespaceonChinese?", 3) == \
               ["RemovewhitespaceonChinese?"]