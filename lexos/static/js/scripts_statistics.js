/**
 * The function to run the error modal.
 * @param htmlMsg {string}: the message to display.
 */
function runModal (htmlMsg) {
  $('#error-modal-message').html(htmlMsg)
  $('#error-modal').modal()
}

/**
 * At least one document is required to run the stats.
 * @returns {string | null}: the errors that is checked by JS, if no error the result will be null.
 */
function submissionError () {
  if ($('#num_active_files').val() < 1) { return 'You must have at least 1 active documents to proceed!' } else { return null }
}

/**
 * The function to convert the form into json
 * @returns {{string: string}}: the form converted to json
 */
function jsonifyForm () {
  const form = {}
  $.each($('form').serializeArray(), function (i, field) {
    form[field.name] = field.value || ''
  })
  return form
}

/**
 * Send the ajax request.
 * @param url {string}: the url to post.
 * @param form {{string: string}}: the form data packed into an object.
 * @returns {jQuery.Ajax}: an jQuery Ajax object.
 */
function sendAjaxRequest (url, form) {
  return $.ajax({
    type: 'POST',
    url: url,
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(form)
  })
}

/**
 * Format the ajax call response to HTML format string.
 * @param response {json}: a json format string.
 * @return {string}: formatted file report.
 */
function formatFileReportResponse (response) {
  // Extract constant result from response.
  const token_name = response['token_name']
  const mean = `<p>Average document size is ${response['mean']} ${token_name}</p>`
  const std_deviation = `<p>Standard deviation of documents is ${response['std_deviation']} ${token_name}</p>`
  const inter_quartile_range = `<p>Inter quartile range of documents is ${response['inter_quartile_range']} ${token_name}</p>`
  // Extract standard deviation anomaly information.
  let anomaly_se
  if (response['anomaly_se'].every(function (element) { return element === null})) {
    anomaly_se = `<p><b>No</b> anomaly detected by standard deviation test.</p>`
  } else {
    anomaly_se = `<p>Anomaly <b>detected</b> by standard error test.</p>`
    response['anomaly_se'].forEach(function (element) {
      if (element !== null) { anomaly_se += `<p style="padding-left: 20px">${element.slice(0, 5).bold()}${element.slice(5, element.length)}</p>` }
    })
  }

  // Extract inter quartile range anomaly information.
  let anomaly_iqr
  if (response['anomaly_iqr'].every(function (element) { return element === null})) {
    anomaly_iqr = `<p><b>No</b> anomaly detected by inter quartile range test.</p>`
  } else {
    anomaly_iqr = `<p>Anomaly <b>detected</b> by inter quartile range test.</p>`
    response['anomaly_iqr'].forEach(function (element) {
      if (element !== null) { anomaly_iqr += `<p style="padding-left: 20px">${element.slice(0, 5).bold()}${element.slice(5, element.length)}</p>` }
    })
  }

  // Return the retracted information.
  return `${mean}${std_deviation}${inter_quartile_range}${anomaly_se}${anomaly_iqr}`
}

/**
 * Display the result of the corpus statistics report on web.
 */
function generateStatsFileReport () {
  $('#status-analyze').css({'visibility': 'visible'})
  // convert form into an object map string to string
  const form = jsonifyForm()

  // send the ajax request
  sendAjaxRequest('/fileReport', form)
    .done(
      function (response) {
        $('#file-report').html(formatFileReportResponse(response))
      })
    .fail(
      function (jqXHR, textStatus, errorThrown) {
        // If fail hide the loading icon.
        $('#status-analyze').css({'visibility': 'hidden'})
        console.log('textStatus: ' + textStatus)
        console.log('errorThrown: ' + errorThrown)
        runModal('Error encountered while generating the corpus statistics.')
      })
}

/**
 * Display the result of the box plot on web page
 */
function generateStatsBoxPlot () {
  $('#status-analyze').css({'visibility': 'visible'})
  // convert form into an object map string to string
  const form = jsonifyForm()

  // send the ajax request
  sendAjaxRequest('/boxPlot', form)
    .done(
      function (response) {
        $('#box-plot').html(response)
      })
    .fail(
      function (jqXHR, textStatus, errorThrown) {
        console.log('textStatus: ' + textStatus)
        console.log('errorThrown: ' + errorThrown)
        runModal('Error encountered while generating the box plot.')
      })
}

/**
 * Display the result of the file statistics on web.
 */
function generateStatsFileTable () {
  $('#status-analyze').css({'visibility': 'visible'})
  // convert form into an object map string to string
  const form = jsonifyForm()

  // the configuration for creating data table
  const dataTableConfig = {
    // Set the initial page length.
    pageLength: 10,

    // Replace entries to documents.
    language: {
      'lengthMenu': 'Display _MENU_ documents',
      'info': 'Showing _START_ to _END_ of _TOTAL_ documents'
    },

    // Specify where the button is.
    dom: '<\'row\'<\'col-sm-2\'l><\'col-sm-3 pull-right\'B>>' +
    '<\'row\'<\'col-sm-12\'tr>>' + '<\'row\'<\'col-sm-5\'i><\'col-sm-7\'p>>',

    // Specify all the download buttons that are displayed on the page.
    buttons: ['copyHtml5', 'excelHtml5', 'csvHtml5', 'pdfHtml5']
  }

  // send the ajax request
  sendAjaxRequest('/fileTable', form)
    .done(
      function (response) {
        const outerTableDivSelector = $('#file-table')
        // put the response onto the web page
        outerTableDivSelector.html(response)
        // initialize the data table
        outerTableDivSelector.children().DataTable(dataTableConfig)
        // display the corpus statistics result
        $('#stats-result').css({'display': 'block'})
      })
    .fail(
      function (jqXHR, textStatus, errorThrown) {
        // If fail hide the loading icon.
        $('#status-analyze').css({'visibility': 'hidden'})
        console.log('textStatus: ' + textStatus)
        console.log('errorThrown: ' + errorThrown)
        runModal('Error encountered while generating the file statistics.')
      })
    .always(
      function () {
        // Always hide the loading icon.
        $('#status-analyze').css({'visibility': 'hidden'})
      }
    )
}

$(function () {
  // Hide the stats result div.
  $('#stats-result').css({'display': 'none'})
  // Hide the normalize options and set it to raw count.
  $('#normalizeTypeRaw').attr('checked', true)
  $('#normalize-options').css({'visibility': 'hidden'})

  // Toggle file selection & reset the maximum number of documents when 'Toggle All' is clicked
  $('#allCheckBoxSelector').on('click', function () {
    if (this.checked) {
      $('.file-selector:not(:checked)').trigger('click')
      $('#cullnumber').attr('max', $('.file-selector:checked').length)
    } else {
      $('.file-selector:checked').trigger('click')
      $('#cullnumber').attr('max', '0')
    }
  })

  /**
   * The event handler for generate statistics clicked. Before generate
   * stats result, get number of active files and id of active files.
   */
  $('#get-stats').click(function () {
    // Get all the checked files.
    const checked_files = $('.eachFileCheck :checked')
    // Set a variable to store checked file ids.
    let active_file_ids = ''
    // Store checked file ids to the variable.
    checked_files.each(function () {
      active_file_ids += `${$(this).val()} `
    })
    // Store the variable to input field.
    $('#active_file_ids').val(active_file_ids)
    // Store the number of active files.
    $('#num_active_files').val(checked_files.length)

    // Get the possible error during the submission.
    const error = submissionError()

    if (error === null) {
      // Only get corpus info when there are more than one file.
      if (checked_files.length > 1) {
        // Get the corpus result.
        generateStatsFileReport()
        // Get the box plot.
        generateStatsBoxPlot()
      }
      // Get the file stats table.
      generateStatsFileTable()
    } else {
      runModal(error)
    }
  })
})
