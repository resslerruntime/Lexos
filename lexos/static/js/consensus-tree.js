$(function(){

    // Display the loading overlay
    start_loading("#consensus-tree-body");

    // Initialize the tooltips for the "Options", "Tokenize", "Normalize",
    // and "Cull" sections
    initialize_analyze_tooltips();
    initialize_tooltips();

    // Register option popup creation callbacks for the "Distance Metric" and
    // "Linkage Method" buttons
    initialize_tree_options();

    // Initialize the legacy form inputs and create the consensus tree
    get_active_file_ids(initialize, "#consensus-tree-body");
});


/**
 * Initializes legacy form inputs and creates the consensus tree.
 * @param {string} response: The response from the "active-file-ids" request.
 */
function initialize(response){

    // Initialize the legacy form inputs. If there are no active documents,
    // display "No Active Documents" text and return
    if(!initialize_legacy_inputs(response)){
        add_text_overlay("#consensus-tree-body", "No Active Documents");
        return;
    }

    // Create the consensus tree
    create_consensus_tree();

    // When the "Generate" button is pressed, recreate the consensus tree
    $("#generate-button").click(function(){
        start_loading("#consensus-tree-body", "#generate-button");
        remove_errors();
        create_consensus_tree();
    });
}


/**
 * Creates the consensus tree.
 */
function create_consensus_tree(){

    // Validate the inputs
    if(!validate_inputs() || !validate_analyze_inputs()) return;

    // Send a request for the consensus tree data
    send_ajax_form_request("consensus-tree/graph")

        // If the request was successful...
        .done(function(response){

            // Create the consensus tree
            $(`
                <div id="consensus-tree" class="hidden">
                    <img src="data:image/png;base64,${response}">
                </div>
            `).appendTo("#consensus-tree-body");

            // Remove the loading overlay, fade in the consensus tree,
            // and enable the "Generate" button
            finish_loading("#consensus-tree-body",
                "#consensus-tree", "#generate-button");
        })

        // If the request failed, display an error, and enable the "Generate"
        // button
        .fail(function(){
            error("Failed to retrieve the consensus tree data.");
            finish_loading("#consensus-tree-body",
                "#consensus-tree", "#generate-button");
        });
}


/**
 * Validate the consensus tree options inputs.
 * @returns {boolean}: Whether the inputs are valid.
 */
function validate_inputs(){

    // "Cutoff"
    if(!validate_number($("#cutoff-input").val(), 0, 1)){
        error("Invalid cutoff.");
        return false;
    }

    // "Iterations"
    if(!validate_number($("#iterations-input").val(), 1)){
        error("Invalid number of iterations.");
        return false;
    }

    return true;
}


/**
 * Initializes the tooltips for the "Options" section.
 */
function initialize_tooltips(){

    // "Distance Metric"
    create_tooltip("#distance-metric-tooltip-button", `Different methods for
        measuring the distance (difference) between documents.`);

    // "Linkage Method"
    create_tooltip("#linkage-method-tooltip-button", `The method used to
        determine when documents and/or other sub-clusters should be joined
        into new clusters.`);

    // "Cutoff"
    create_tooltip("#cutoff-tooltip-button", `0.5 means a document must
        appear in a clade in at least 50% of the iterations.`);

    // "Iterations"
    create_tooltip("#iterations-tooltip-button", `For 100 iterations, 80% of
        the tokens will be chosen with or without replacement.`);
}