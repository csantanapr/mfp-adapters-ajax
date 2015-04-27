function wlCommonInit() {
  /*
   * Use of WL.Client.connect() API before any connectivity to a MobileFirst Server is required.
   * This API should be called only once, before any other WL.Client methods that communicate with the MobileFirst Server.
   * Don't forget to specify and implement onSuccess and onFailure callback functions for WL.Client.connect(), e.g:
   *
   *    WL.Client.connect({
   *    		onSuccess: onConnectSuccess,
   *    		onFailure: onConnectFailure
   *    });
   *
   */

  // Common initialization code goes here


}
var adapterName = 'cnnadapter';
var adapterProcedure = 'getStories';


function onSendAjaxRequest() {
  WL.App.getServerUrl(function(serverBaseUrl) {
    if (serverBaseUrl.substr(-1) != '/') {
      serverBaseUrl = serverBaseUrl + '/';
    }
    console.log('serverBaseUrl=' + serverBaseUrl);
    onSendRequest(serverBaseUrl + 'adapters/' + adapterName + '/' + adapterProcedure).always(onResponse);
  });

}

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

function onSendRequest(url) {
  // Use JavaScript promises for asynchronous operations
  var dfd = $.Deferred();

  // Create the custom request
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onreadystatechange = function(e) {
    if (this.readyState == 4) {
      if (this.status === 200) {
        dfd.resolve(JSON.parse(this.response));
      } else {
        // 401 response the first time. Need to check whether this is an OAuth error, or not
        var authHeader = xhr.getResponseHeader('WWW-Authenticate');
        if (WLAuthorizationManager.isAuthorizationRequired(xhr.status, authHeader)) {
          // Get the authorization scope from the authentication header
          var scope = WLAuthorizationManager.getAuthorizationScope(authHeader);

          // If program reaches here, the cached authorization header was missing or was not good
          // obtain the header again and retry the request
          WLAuthorizationManager.obtainAuthorizationHeader(scope).then(
            function(header) {
              // The auth header was received successfully
              // The request should be constructed again, therefore this call is recursive
              console.log('got oAuth Header');
              console.log(header);
              onSendRequest(url)
                .then(
                  function(response) {
                    dfd.resolve(JSON.parse(response));
                  },
                  function(error) {
                    dfd.reject(error);
                  }
                );
            },
            function(error) {
              // Unable to retrieve the authorization header, fail the request; the failure will be propagated up the chain
              dfd.reject(error);
            }
          );
        } else {
          // Not an OAuth error, fail the request
          dfd.reject(xhr);
        }
      }
    }
  };

  // Try to send a request with cached authorization header, which may be null
  WLAuthorizationManager.addCachedAuthorizationHeader(xhr)
    .always(
      // Send the request
      function() {
        xhr.send();
      }
    );

  return dfd.promise();
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
