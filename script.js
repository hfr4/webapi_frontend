var apiUrl = 'https://hfr4webapi-gkaremhrfcfkema0.westeurope-01.azurewebsites.net/api/'
// var apiUrl = 'http://localhost:5299/api/'


////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', loadUsername);
document.getElementById('getAllWeathersBtn')?.addEventListener('click', getAllWeathersForecast);
document.getElementById('logInBtn')?.addEventListener('click', logIn);
document.getElementById('logOutBtn')?.addEventListener('click', logOut);
document.getElementById('AddWeatherBtn')?.addEventListener('click', addWeatherForecast);
document.getElementById('DelAllWeathersBtn')?.addEventListener('click', delAllWeatherForecasts);


////////////////////////////////////////////////

function loadUsername () {
    var navUsername_element = document.getElementById('navUsername');
    var logOutBtn_element   = document.getElementById('logOutBtn');

    var cookie = getCookie("username");

    if (cookie) {
        logOutBtn_element.style.display = 'block';
        navUsername_element.innerHTML = cookie;
    } else {
        logOutBtn_element.style.display = 'none';
        navUsername_element.innerHTML = 'Guest';
    }
}

async function getAllWeathersForecast() {
    var response = await fetch(`${apiUrl}weatherforecast`);
    if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        alert('Failed to fetch forecasts. Please try again.');
    } else {
        var data = await response.json();
        displayAllWeatherForecast(data);
    }
}

async function addWeatherForecast() {
    var headers = {
        'Content-Type': 'application/json'
    };

    var jwt = getCookie("jwt");
    if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
    }

    var response = await fetch(`${apiUrl}weatherforecast`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({}) // Empty body as requested
    });

    if (!response.ok) {
        if (response.status == 401) {
            alert('You need to be authentified as Administrator to add a forecast !');
        } else {
            console.error(`HTTP error! status: ${response.status}`);
        }
    } else {
        alert('Forecast added successfully!');
    }
}

async function delAllWeatherForecasts() {
    var headers = {
        'Content-Type': 'application/json'
    };

    var jwt = getCookie("jwt");
    if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
    }

    var response = await fetch(`${apiUrl}weatherforecast`, {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({}) // Empty body as requested
    });

    if (!response.ok) {
        if (response.status == 401) {
            alert('You need to be authentified as Administrator to delete the forecasts !');
        } else {
            console.error(`HTTP error! status: ${response.status}`);
        }
    } else {
        alert('All Weather forecasts deleted successfully!');
    }
}

function displayAllWeatherForecast(forecasts) {
    var container = document.getElementById('allWeathersContainer');
    container.innerHTML = ''; // Clear previous content

    if (forecasts.length == 0) {
        container.innerHTML = "<hr/> <p>No forecast, add one via the add menu !</p>";
    } else {
        forecasts.forEach(forecast => {
            var card = document.createElement('div');
            card.className = 'weather-card';
            card.innerHTML = `
                <hr/>
                <div>
                    <div><b>Date:</b> ${forecast.date}</div>
                    <div><b>Temperature:</b> ${forecast.temperatureC}°C / ${forecast.temperatureF}°F</div>
                    <div><b>Summary:</b> ${forecast.summary}</div>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

function displayOneWeatherForecast(forecast) {
    var container = document.getElementById('oneWeatherContainer');
    container.innerHTML = ''; // Clear previous content

    var card = document.createElement('div');
    card.className = 'weather-card';
    card.innerHTML = `
        <hr/>
        <div>
            <div><b>Date:</b> ${forecast.date}</div>
            <div><b>Temperature:</b> ${forecast.temperatureC}°C / ${forecast.temperatureF}°F</div>
            <div><b>Summary:</b> ${forecast.summary}</div>
        </div>
    `;
    container.appendChild(card);
}

async function logIn() {
    try {
        var username = document.getElementById('usernameInput').value;
        var password = document.getElementById('passwordInput').value;

        var response = await fetch(`${apiUrl}Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        var jwt = await response.text();

        var name    = "jwt";
        var expires = getJWTExpirationDate(jwt);
        var value   = jwt
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;

        name    = "username";
        expires = getJWTExpirationDate(jwt);
        value   = username
        document.cookie =  `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;

        alert('Login successful!\nWelcome back ' + username + '!');
    } catch (error) {
        console.error('Error during login:', error);

        alert('Login failed. Please try again.');
    }

    loadUsername();
}

function logOut() {
    removeCookie("jwt");
    removeCookie("username");

    loadUsername();
}

function getJWTExpirationDate(jwt) {
    var [header, payload, signature] = jwt.split('.');
    var decodedPayload = JSON.parse(atob(payload));
    var expirationTimestamp = decodedPayload.exp;
    return new Date(expirationTimestamp * 1000);
}

function getCookie(name) {
    var cookieString = decodeURIComponent(document.cookie);
    var cookies      = cookieString.split('; ');
    var cookie       = cookies.find(row => row.startsWith(name + '='));
    return cookie ? cookie.split('=')[1] : null;
}

function removeCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}