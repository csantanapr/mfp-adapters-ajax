var Messages = {
    // Add here your messages for the default language.
    // Generate a similar file with a language suffix containing the translated messages.
    // key1 : message1,
};

var wlInitOptions = {
    // Options to initialize with the WL.Client object.
    // For initialization options please refer to IBM MobileFirst Platform Foundation Knowledge Center.
};

// Called automatically after MFP framework initialization by WL.Client.init(wlInitOptions).
function wlCommonInit(){
	// Common initialization code goes here
    alert('MFP CLient SDK Ready');
}
var adapterName = 'cnnadapter';
var adapterProcedure = 'getStories';

function onSendWLRequest() {
  new WLResourceRequest(
      'adapters/' + adapterName + '/' + adapterProcedure,
      WLResourceRequest.GET
    )
    .send()
    .then(
      onResponse,
      onResponse
    );
}

function onResponse(response) {
  //alert(JSON.stringify(response));
  console.log(response);
  if (response.responseText) { //to filter long text from textarea
    delete response.responseText;
  }
  document.getElementById('resultLabel').innerHTML = 'Results for ' + adapterName + '/' + adapterProcedure;
  document.getElementById('result').value = JSON.stringify(response, null, '\t');
}
