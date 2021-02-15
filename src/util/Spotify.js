const clientId = process.env.REACT_APP_CLIENTID;
const redirectUri = process.env.REACT_APP_REDIRECTURI;

let accessToken;

export const Spotify = {
    getAccessToken() {
        // check for existing token
        if (accessToken) {
            return accessToken;
        }

        // check for an access token match in url using regex match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        console.log(accessTokenMatch);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        console.log(expiresInMatch);

        if (accessTokenMatch && expiresInMatch) {
            // if access token and expires in both present, set as accessToken value
            accessToken = accessTokenMatch[1];
            // convert expiresIn to number
            const expiresIn = Number(expiresInMatch[1])

            // clear access parameters from URL so app doesn't try to grab access token after it's expired
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            
            return accessToken;
        } else {
            // redirect instructions
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`
            window.location = accessUrl;
        }

    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        // start promise chain by returning GET request to Spotify endpoint
        // add authorisation header to request containing access data
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
            { headers: {
                Authorization: `Bearer ${accessToken}`
                }
            }
        ).then(response => {
            return response.json();
        }
        ).then(jsonResponse => {
            if(!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
        });
    },

    savePlaylist(name, trackUris) {
        if(!name || !trackUris.length) {
            return;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = {
            Authorization: `Bearer ${accessToken}`
        }
        let userId;

        return fetch('https://api.spotify.com/v1/me', {headers: headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: name})
            // convert response to JSON and save response id param to playlistID      
            }).then(response => response.json()
            ).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                //return fetch(`https://api.spotify.com//v1/users/${userId}/playlists/${playlistId}/tracks`, {
                return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {    
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ uris: trackUris})
                })
            })
        });
    }

}

