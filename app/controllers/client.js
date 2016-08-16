function updateGo(element, placeId) {
    ajaxRequest('GET', '/api/go/' + placeId, function(goObj) {
        var auth = goObj.hasOwnProperty('going');
        
        if (!auth) {
            return;
        } else {
            if (goObj.going) {
                // going
                ajaxRequest('DELETE', '/api/go/' + placeId, function(goObject) {
                    element.innerHTML = 'Going: ' + goObject.count; 
                });
            } else {
                // not going
                ajaxRequest('POST', '/api/go/' + placeId, function(goObject) {
                    element.innerHTML = 'Going: ' + goObject.count + '(You are going)'; 
                });
            }
        }
    }); 
}

function printList(places) {
    var list = document.getElementById('list');
    var n = places.length;
                
    list.innerHTML = '';
                
    places.forEach(function(place) {
        list.innerHTML += '<div class="row place">' + '<div class="col-md-2 image"></div>' 
            + '<div class="col-md-8 col-xs-10 info">' + place.name 
            + '<br>' + place.address + '<br>' + (place.openNow? 'Open': 'Close') 
            + '</div>' + '<div class="col-md-2 going"><span onclick="updateGo(this, '
            + "'" + place.placeId + "'" + ')" class="go"></span></div>' + '</div>';
    });
                
    var goingResults = [];
    var imageResults = [];
    var goingCount = 0;
    var imageCount = 0;
    var imgArr = document.querySelectorAll('.image'); 
    var goArr = document.querySelectorAll('.go');
            
    function getGoing(i) {
        ajaxRequest('GET', '/api/go/' + places[i].placeId, function(goObj) {
            goingResults[i] = goObj;
            goingCount++;
            if (goingCount === n) 
                for (var j = 0; j < n; ++j) {
                    goArr[j].innerHTML = 'Going: ' + goingResults[j].count + (goingResults[j].going? '(You are going)': '');
                }
        });
    }
                
    function getImage(i) {
        ajaxRequest('GET', '/api/image/' + places[i].photoReference, function(imgObj) {
            imageResults[i] = imgObj;
            imgArr[i].innerHTML = '<img class="img-responsive" src="' + imageResults[i].imageUrl + '" alt="image">';
                
        });
    }
                
    for (var i = 0; i < n; ++i) {
        getImage(i);
        getGoing(i);
    }
}

function main() {
    var searchBtn = document.getElementById('searchBtn'),
        searchInput = document.getElementById('searchInput'),
        list = document.querySelector('#list ul');
    var auth = (document.querySelector('#user a').innerHTML === 'Log out');
    
    console.log(auth);
    if (auth) {
        ajaxRequest('GET', '/api/lastsearch', function(places) {
            console.log(places.length);
            if (places.length > 0) 
                printList(places); 
        });
    }
    
    searchBtn.addEventListener('click', function() {
        
        var re = /^\s+$/;
        var textSearch = searchInput.value;
        
        if (re.test(textSearch) || textSearch === '')
            alert('Enter something to search');
        else {
            // search
            ajaxRequest('GET', '/api/search/' + textSearch, function(places) {
                printList(places);
            });
        }
    });
}

ready(main);