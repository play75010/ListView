var isConnected = false;

$(document).bind( "mobileinit", function(event) {
	$.mobile.defaultPageTransition = "none" ;
});

$(document).ready(function() {
	if (document.location.protocol == 'file:') {
	    // file protocol indicates phonegap
	    document.addEventListener('deviceready', ondeviceready, false);
	} else {
	    isConnected = true;
	    // no phonegap, start initialisation immediately
	    $.getScript('./appjs/geo.js');
	}
    });    

function ondeviceready() {

    $.mobile.pushStateEnabled = false;

    document.addEventListener("online", onOnline, false);
    document.addEventListener("offline", onOffline, false);

    // assume that connection is on
    isConnected = true;

    // Phonegap. Get GPS lon, lat through phonegap
    var options = {
	maximumAge: 3000,
	timeout: 5000,
	enableHighAccuracy: true
    };
    navigator.geolocation.getCurrentPosition(getGeo, geoError, options);
}

function onOnline() {
    isConnected = true;
}

function onOffline() {
    isConnected = false;
}

function alertDismissed() {
    // Nothing to do. But required by navigator.notification.alert()
    var res = new Array();
    res['res'] = 'none';
    elist(res);
}

function unconnected() {
    navigator.notification.alert("No connection to the internet. Please ensure that flight mode is disabled.", alertDismissed, "Test", "OK");
}

function getGeo(pos) {
    document.getElementById('lon').value = pos.coords.longitude;
    document.getElementById('lat').value = pos.coords.latitude;
    if(isConnected) {
	$.getJSON('http://wouf.it/test.php?lon='+lon+'&lat='+lat+ '&elist=?');
    } else {
	unconnected();
    }
}

function geoError() {
    navigator.notification.alert("We couldn't find your location. Please restart.", alertDismissed, "Test", "OK");
}

function elist(res){
    if(res['res'] != 'OK' || res['msg'] == 'more100' || res['numevents'] == 0) {
	$('#addedlist').html("<li><center>We couldn't find any event near you.</center></li>");
	$('#addedlist').listview('refresh');
	return;
    }
	
    var html = '';

    for(i=0;i< res['e'].length; i++) {
	var startdate = new Date(res['e'][i]['year'], (res['e'][i]['month'] -1), res['e'][i]['day']); 

	html += '<li class="ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-has-icon ui-btn-up-c" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="c"><div class="ui-btn-inner ui-li"><div class="ui-btn-text"><a class="ui-link-inherit" href="#event?id='+res['e'][i]['fbeid']+'"><img class="ui-li-icon ui-li-thumb" src="'+res['e'][i]['fbpic_square']+'"></img><h1 class="ui-li-heading">'+res['e'][i]['fbname']+'</h1><p class="ui-li-desc">'+startdate.toLocaleDateString() + ' ' + res['e'][i]['hour'] + ':' + res['e'][i]['min'] + ' - ' + res['e'][i]['dist'] + ' km</p></a></div><span class="ui-icon ui-icon-arrow-r ui-icon-shadow"></span></div></li>';

	//	html += '<li><a href="#event?id=' + res['e'][i]['fbeid'] + '"><img class="ui-li-icon" src="' + res['e'][i]['fbpic_square'] + '"><h1 class="ui-li-heading">' + res['e'][i]['fbname'] + '</h1><p class="ui-li-desc">' + startdate.toLocaleDateString() + ' ' + res['e'][i]['hour'] + ':' + res['e'][i]['min'] + ' - ' + res['e'][i]['dist'] + ' km</p></a></li>';
    }

    if(res['curpage'] == 0) {
	$('#addedlist').html(html);
    } else {
	$('#addedlist').append(html);
    }

    $('#addedlist').listview();
}

