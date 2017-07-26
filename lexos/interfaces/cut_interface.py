import json

from flask import request, session, render_template

from lexos.helpers import constants as constants
from lexos.managers import utility, session_manager as session_manager
from lexos_core import app
from lexos.interfaces.base_interface import detect_active_docs


@app.route("/cut", methods=["GET", "POST"])
def cut():
    """
    Handles the functionality of the cut page. It cuts the files into various
    segments depending on the specifications chosen by the user, and sends the
     text segments.
    Note: Returns a response object (often a render_template call) to flask and
     eventually to the browser.
    """

    # Detect the number of active documents.
    num_active_docs = detect_active_docs()

    file_manager = utility.load_file_manager()

    active = file_manager.get_active_files()
    if len(active) > 0:

        num_char = [x.num_letters() for x in active]
        num_word = [x.num_words() for x in active]
        num_line = [x.num_lines() for x in active]
        max_char = max(num_char)
        max_word = max(num_word)
        max_line = max(num_line)
        active_file_ids = [lfile.id for lfile in active]

    else:
        num_char = []
        num_word = []
        num_line = []
        max_char = 0
        max_word = 0
        max_line = 0
        active_file_ids = []

    if request.method == "GET":
        # "GET" request occurs when the page is first loaded.
        if 'cuttingoptions' not in session:
            session['cuttingoptions'] = constants.DEFAULT_CUT_OPTIONS

        previews = file_manager.get_previews_of_active()

        return render_template(
            'cut.html',
            previews=previews,
            num_active_files=len(previews),
            numChar=num_char,
            numWord=num_word,
            numLine=num_line,
            maxChar=max_char,
            maxWord=max_word,
            maxLine=max_line,
            activeFileIDs=active_file_ids,
            itm="cut",
            numActiveDocs=num_active_docs)


@app.route("/downloadCutting", methods=["GET", "POST"])
def download_cutting():
    # The 'Download Segmented Files' button is clicked on cut.html
    # sends zipped files to downloads folder
    file_manager = utility.load_file_manager()
    return file_manager.zip_active_files('cut_files.zip')


@app.route("/doCutting", methods=["GET", "POST"])
def do_cutting():
    file_manager = utility.load_file_manager()
    # The 'Preview Cuts' or 'Apply Cuts' button is clicked on cut.html.
    session_manager.cache_cutting_options()

    # Saving changes only if action = apply
    saving_changes = True if request.form['action'] == 'apply' else False
    previews = file_manager.cut_files(saving_changes=saving_changes)
    if saving_changes:
        utility.save_file_manager(file_manager)

    data = {"data": previews}
    data = json.dumps(data)
    return data
