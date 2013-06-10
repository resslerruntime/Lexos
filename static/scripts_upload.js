function havefile() {
	xhr = new XMLHttpRequest();

	// Ajax gives the XMLHttpRequest
	ajaxRequestURL = document.getElementById("upload").action.split("/").slice(0,-1).join("/") + "/ajaxrequest";

	xhr.open("GET", ajaxRequestURL, false);
	xhr.send();

	if (xhr.responseText == 'False') {
		alert("No files uploaded yet");
		return false;
	}
}

$(function() {
	$("#uploadbrowse").click(function() {
		$("#fileselect").click();
	});
});

/*
filedrag.js - HTML5 File Drag & Drop demonstration
Featured on SitePoint.com
Developed by Craig Buckler (@craigbuckler) of OptimalWorks.net
*/
$(function() {

	// getElementById
	function $id(id) {
		return document.getElementById(id);
	}

	// output information
	function PreOutput(msg) {
		var m = $id("premessages");
		m.innerHTML = msg + m.innerHTML;
	}

	// output information
	function Output(msg) {
		var m = $id("messages");
		m.innerHTML = msg + m.innerHTML;
	}


	// file drag hover
	function FileDragHover(e) {
		e.stopPropagation();
		e.preventDefault();
		e.target.className = (e.type == "dragover" ? "hover" : "");
	}


	// file selection
	function FileSelectHandler(e) {

		// cancel event and hover styling
		FileDragHover(e);

		// fetch FileList object
		var files = e.target.files || e.dataTransfer.files;

		// process all File objects
		for (var i = 0, f; f = files[i]; i++) {
			UploadAndParseFile(f);
		}

	}


	// upload and display file contents
	function UploadAndParseFile(file) {

		var xhr = new XMLHttpRequest();
		if (xhr.upload && (file.type == "text/plain" || file.type == "text/html" || file.type == "text/xml" || file.type == "text/sgml") && file.size <= $id("MAX_FILE_SIZE").value) {
			var uploadURL = $id("upload").action

			// start upload
			xhr.open("POST", uploadURL, false);
			xhr.setRequestHeader("X_FILENAME", file.name);
			xhr.send(file);
		}

		if (file.type.indexOf("text") == 0) {
			var reader = new FileReader();
			reader.onload = function(e) {
				// Detect whether the file has HTML or XML tags
				var pattern = new RegExp("<[^>]+>");
				var hasTags = pattern.test(e.target.result);
				// Update the checkTags and formmatingbox hidden inputs.
				// Show the strip tags form fields.
				if (hasTags == true && (file.type == "text/sgml" || file.type == "text/plain")) {
					$("#tags").val("on");
				}
				Output(
					"<p><strong>" + file.name + ":</strong></p><div class=\"filepreview\">" +
					e.target.result.replace(/</g, "&lt;").replace(/>/g, "&gt;") +
					"</div>"
				);
			}
			reader.readAsText(file);

			PreOutput(
			"<p>File information: <strong>" + file.name +
			"</strong> type: <strong>" + file.type +
			"</strong> size: <strong>" + file.size +
			"</strong> bytes</p>"
			);
		}
	}

		

	// initialize
	function Init() {

		var fileselect = $id("fileselect"),
			filedrag = $id("dragndrop"),
			submitbutton = $id("submitbutton");

		// file select
		fileselect.addEventListener("change", FileSelectHandler, false);

		// is XHR2 available?
		var xhr = new XMLHttpRequest();
		if (xhr.upload) {

			// file drop
			filedrag.addEventListener("dragover", FileDragHover, false);
			filedrag.addEventListener("dragleave", FileDragHover, false);
			filedrag.addEventListener("drop", FileSelectHandler, false);
		}
	}

	// call initialization file
	if (window.File && window.FileList && window.FileReader) {
		Init();
	}


})();