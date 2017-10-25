var userToken;

function login() {
    DZ.login(function (response) {
        if (response.authResponse) {
            console.log('Welcome!  Fetching your information.... ');
            DZ.api('/user/me', function (response) {
                console.log('Good to see you, ' + response.name + '.');
		document.getElementById('loginBlock').style.display="none";
		document.getElementById('userName').innerHTML=response.name;
		document.getElementById('loggedBlock').style.display="block";
		getPlaylists();
            });
            userToken = response.authResponse.accessToken;
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, { perms: 'email, manage_library' });
};

//SEARCH
function search(term){
    DZ.api('/search?q=' + term, function(response){
        console.log(response.data);
    });
}

//EDITORIAL
function getEditoSelection(genreId){
    DZ.api('/editorial/' + genreId + '/selection', function(response){
        console.log(response);

        //plays the first album of the retrieved selection
        DZ.player.playAlbum(response.data[0].id);
    });
}

//ALBUMS
function getAlbumInfo(albumId){
    DZ.api('/album/' + albumId, function(response){
        console.log(response);
    });
}

function getAlbumCover(albumId) {
    DZ.api('/album/' + albumId, function (response) {
        console.log(response);
        var bckgd = response.cover + '&size=small';
        $('#preview').attr('src', bckgd);
    });
}

function favoriteAlbum(albumId) {
    //add an album to my favorites
    DZ.api('/user/me/albums', 'POST',
        {
            album_id : albumId, 
            access_token: userToken}, 
            function (response) {
        console.log(response);
    });
}

function getPlaylists() {
    playlistChoices = "";
    DZ.api('/user/me/playlists?access_token='+userToken, 
    function (response) {
	response.data.forEach(function(value){
		playlistChoices += "<option value='"+value.id+"'>"+value.title+"</option>";
        });
        document.getElementById('playlistChoice').innerHTML=playlistChoices;
    });
}


function playPlaylist()
{
	playlistId = parseInt(document.getElementById('playlistChoice').value);
	DZ.player.playPlaylist(playlistId, false);
}

function addSongToPlaylist() {
    playlistId = document.getElementById('playlistChoice').value;
    songId = document.getElementById('songID').value;
    var songListParam = "";
    var trackList = DZ.player.getTrackList();
    trackList.forEach(function(value)
    		{
                        songListParam += value.id+",";
    		});
    songListParam += songId;
    DZ.api('/playlist/' + playlistId + '/tracks', 'POST',
        {
            songs : songListParam,
            order : songListParam,
            access_token: userToken
        },
        function (response) {
        	if(response.error)
        	{
				console.log(response.error);
			}
			else
			{
				DZ.player.addToQueue([songId]);
				alert("Song "+songId+" added to playlist "+playlistId);
			}
        });
}
