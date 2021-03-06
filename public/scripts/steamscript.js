

const weatherForm = document.querySelector('form');
const searchData = document.querySelector('input');
const friendlistResults = document.querySelector("#friendlist-output");
// const friendlistAvatars = document.querySelector("#friendlist-avatar");
const allIDcopies = document.querySelector("#allIDcopies");
const togglePresetIDs = document.querySelector("#togglePresetIDs-btn");
const inputfield = document.getElementById("steamIDinputfield");
const loadingScreen = document.getElementById("second_centerContent");
const gameHistoryGrid = document.getElementById("gameHistoryGrid")
const mostplayedgameslist = document.getElementById("profileallTimeGameList")
const alltimegamesplayed_header = document.getElementById("profileAllTimeGameHeader")
const mainScreen = document.getElementById("main-content")
const setAvatarMedium = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg'


const steamUserIDList = [
    { name: "Rapidall", id: "76561198035585856" },
    { name: "Blakan", id: "76561198035952833" },
    { name: "Honken", id: "76561198226138660" },
    { name: "Dakini", id: "76561198331058424" },
    { name: "Artificial Intelligence", id: "76561198326419477" },
    { name: "Nessie", id: "76561198201294175" },
    { name: "NOLIFER", id: "76561198022679364" },
    { name: "antiturtle", id: "76561198011769010" }
]

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

var is_presetIDs_visible = false


generateIDcopies = () => {
    var dropdownContent = document.getElementById("myDropdown");
    for (let i = 0; i < steamUserIDList.length; i++) {
        dropdownContent.innerHTML += `
        <a class="idcopynames" id="uniqueID` + i + `">` + steamUserIDList[i].name + `</a>`
    }
}

generateIDcopies();

for (let k = 0; k < steamUserIDList.length; k++) {
    document.getElementById("uniqueID" + k).addEventListener("click", () => {
        // Paste into search field
        inputfield.value = steamUserIDList[k].id
        // animate searchfield with a faint blinking color
        searchFieldBlinkEffect();
    })
}


copyId = (steamUsername) => {
    inputfield.style.animationName = ""
    for (let i = 0; i < steamUserIDList.length; i++) {
        if (steamUsername === steamUserIDList[i].name) {
            /*     // Save to clipboard
            var copyText = document.getElementById("uniqueID" + steamUserIDList[i].name)
            copyText.select();
            copyText.setSelectionRange(0, 99999)
            document.execCommand("copy");     */
            // Paste into search field
            inputfield.value = steamUserIDList[i].id
            // animate searchfield with a faint blinking color
            searchFieldBlinkEffect();
            return
        }
    }
    console.log("copyID() ERROR!")
}

inputfield.addEventListener("animationend", () => {
    inputfield.style.animationName = ""
})

searchFieldBlinkEffect = (searchfailed) => {
    if (searchfailed === "failed") {
        return inputfield.style.animationName = "searchFailed"
    }
    // animate searchfield with a faint blinking color
    inputfield.style.animationName = "idCopied"
}

searchFieldEffectEnd = () => {
    inputfield.style.animationName = ""
}


var friendids = []
var friendnames = []
var friendAvatars = []

const friendlistUser = document.querySelector("#friendlist-user");
const profileInfo = document.querySelector("#profileGrid");
var recentlyPlayedLoaded = true;
var friendlistLoaded = true;
var ownedgamesLoaded = true;
var getuserLoaded = true;
var startscreen_visible = "page_loaded";

addEventListener('submit', (e) => {
    e.preventDefault()
    const steamID = searchData.value
    if (steamID === "") {
        searchFieldBlinkEffect("failed")
        return
    }
    if (friendlistLoaded === false) {
        return console.log("Friendlist needs to load first.")
    } else if (recentlyPlayedLoaded === false) {
        return console.log("Game history needs to load first.")
    } else if (ownedgamesLoaded === false) {
        return console.log("Owned games needs to load first.")
    } else if (getuserLoaded === false) {
        return console.log("Get user data needs to load first.")
    }

    // show loader for recently played + profile + friendlist
    loadingEffect = (on_or_off, content_loading) => {
        if (on_or_off === "on") {
            document.getElementById("friends_loading").style.display = "block"
            document.getElementById("profile_loading").style.display = "block"
            document.getElementById("leftcontent_loading").style.display = "block"
            document.getElementById("searchbar_loading").style.display = "block"
        } else if (on_or_off === "off") {
            document.getElementById(content_loading + "_loading").style.display = "none"
        }
    }
    loadingEffect("on");
    // loadingEffect("off", "friends");

    // this will fix the friendlist if it goes from hidden to search new user
    document.querySelector("#friendlist-block").style.height = ""

    // remove startscreen forever
    startscreen_visible = "removed";

    recentlyPlayedLoaded = false;
    friendlistLoaded = false;
    ownedgamesLoaded = false;
    getuserLoaded = false;

    mainScreen.style.display = "grid"
    loadingScreen.style.display = "none"


    document.getElementById("userHidden").innerHTML = ""
    document.getElementById("userPublic").style.display = "none"
    document.getElementById("userHidden").style.display = "block"
    friendlistUser.textContent = "";
    friendlistResults.innerHTML = "";
    gameHistoryGrid.innerHTML = ""
    document.getElementById("profileCreation").innerHTML = "..."
    alltimegamesplayed_header.textContent = ""
    document.getElementById("profileIngameBlock").style.display = "none"


    // bugged avatar_medium: 76561197981959702


    // Get User data stuffs
    fetch('/steam/getuser?steamid=' + steamID).then((response) => {
        response.json().then((data) => {
            // throw "bug testing"
            if (data.error) {
                // if user not found => show that page
                userfound = false;
                navbar_go_to("user profile")
                console.log("Can't find user.")
                mainScreen.style.display = "none"
                loadingScreen.style.display = "block"
                loadingScreen.innerHTML = "User not found. <br>Please try again."
                getuserLoaded = true;
                friendlistLoaded = true;
                recentlyPlayedLoaded = true;
                ownedgamesLoaded = true;
                loadingEffect("off", "leftcontent");
                loadingEffect("off", "profile");
                loadingEffect("off", "friends");
            } else {
                // user found, display data and set variable to true (for navbar functionality)
                // also go to user profile page (NOT user not found)
                userfound = true;
                navbar_go_to("user profile")
                document.getElementById("profileUser").innerHTML = ""
                // All time game list refresh
                mostplayedgameslist.innerHTML = ""
                // setup user avatar in center section
                var profileImg = document.createElement("IMG")
                profileImg.id = "profileImage"
                profileImg.setAttribute('src', data.userdata.playerAvatar)
                profileImg.setAttribute('alt', "avatar")
                document.getElementById("profileUser").appendChild(profileImg)
                // setup username in center section
                var profileName = document.createElement("DIV")
                profileName.id = "profileName"
                profileName.innerHTML = data.userdata.playerName
                document.getElementById("profileUser").appendChild(profileName)

                console.log(data.userdata)

                // set last online

                if (typeof data.userdata.playerLastlogoff === "number") {
                    var logoffTime = new Date(data.userdata.playerLastlogoff * 1000);

                    // if minutes and hours < 10 add a 0
                    var logoffHours = logoffTime.getHours()
                    var logoffMinutes = logoffTime.getMinutes()
                    if (logoffHours < 10) {
                        logoffHours = "0" + logoffHours
                    }
                    if (logoffMinutes < 10) {
                        logoffMinutes = "0" + logoffMinutes
                    }


                    document.getElementById("profileLastonline").textContent = logoffHours + ":" + logoffMinutes + " - " + monthNames[logoffTime.getMonth()] + ' ' + logoffTime.getDate() + ', ' + logoffTime.getFullYear()
                    document.getElementById("profileLastlogoffBlock").style.display = "flex"
                } else {
                    // hide it
                    document.getElementById("profileLastlogoffBlock").style.display = "none"
                }

                // set player visibility
                if (data.userdata.playerVisibility === 1) {
                    currentUserPrivacy = "Private"
                    currentUserPrivacyColor = "orange"
                } else if (data.userdata.playerVisibility === 3) {
                    currentUserPrivacy = "Public"
                    currentUserPrivacyColor = "white"
                }
                document.getElementById("profilePrivacy").textContent = currentUserPrivacy
                document.getElementById("profilePrivacy").style.color = currentUserPrivacyColor

                loadingEffect("off", "profile");
                if (data.userdata.playerVisibility === 2) {
                    document.getElementById("userHidden").innerHTML = "The privacy settings for this user is set to private. <br>Information is limited."
                } else {
                    document.getElementById("userPublic").style.display = "grid"
                    document.getElementById("userHidden").style.display = "none"
                    document.getElementById("userHidden").innerHTML = ""
                }

                var createdTime = new Date(data.userdata.playerCreated * 1000);
                document.getElementById("profileCreation").innerHTML = monthNames[createdTime.getMonth()] + ' ' + createdTime.getDate() + ', ' + createdTime.getFullYear()

                var currentStatus
                var currentStatusColor
                if (data.userdata.playerStatus === 0) {
                    currentStatus = "Offline"
                    currentStatusColor = "gray"
                } else if (data.userdata.playerStatus === 1) {
                    currentStatus = "Online"
                    currentStatusColor = "green"
                } else if (data.userdata.playerStatus === 2) {
                    currentStatus = "Busy"
                    currentStatusColor = "red"
                } else if (data.userdata.playerStatus === 3) {
                    currentStatus = "Away"
                    currentStatusColor = "orange"
                } else if (data.userdata.playerStatus === 4) {
                    currentStatus = "Snooze"
                    currentStatusColor = "orange"
                } else if (data.userdata.playerStatus === 5) {
                    currentStatus = "Looking to trade"
                    currentStatusColor = "yellow"
                } else if (data.userdata.playerStatus === 6) {
                    currentStatus = "Looking to play"
                    currentStatusColor = "green"
                } else {
                    currentStatus = "Bug?"
                    currentStatusColor = "yellow"
                }
                document.getElementById("profileStatus").style.color = currentStatusColor
                document.getElementById("profileStatus").innerHTML = currentStatus

                var ingame_id
                var ingame_name
                if (typeof data.userdata.playerIngame != "undefined") {
                    // show
                    ingame_id = data.userdata.playerIngameid;
                    ingame_name = data.userdata.playerIngame;
                    document.getElementById("profileIngameBlock").style.display = "flex"
                    document.getElementById("profileIngame").innerHTML = data.userdata.playerIngame
                }


                // alltime gamelist stuffs
                fetch('/steam/ownedgames?steamid=' + steamID).then((response) => {
                    response.json().then((data) => {
                        if (data.error) {
                            alltimegamesplayed_header.textContent = "Games are unavailable."
                            // profileInfo.innerHTML = data.error;
                        } else {
                            var numberofgamestoshow
                            if (data.owned_games.length > 50) {
                                numberofgamestoshow = 50
                            } else {
                                numberofgamestoshow = data.owned_games.length
                            }
                            mostplayedgameslist.innerHTML = ""
                            for (let i = 0; i < numberofgamestoshow; i++) {
                                // add image
                                var alltimegameavatars = document.createElement("IMG")
                                alltimegameavatars.setAttribute('src', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/db/' + data.owned_games[i].img_icon_url + '.jpg');
                                alltimegameavatars.setAttribute('onerror', `this.onerror=null;this.src=` + setAvatarMedium)
                                alltimegameavatars.className = "profileGameAvatars"
                                mostplayedgameslist.appendChild(alltimegameavatars)
                                // add gamename
                                var alltimegamesplayed = document.createElement("DIV")
                                alltimegamesplayed.innerHTML = data.owned_games[i].name
                                alltimegamesplayed.className = "profileGamesOwned"
                                mostplayedgameslist.appendChild(alltimegamesplayed)
                                // add hours played all time
                                var alltimegamestimeplayed = document.createElement("DIV")
                                // if playtime_forever on a game is > 6000min/100hours don't use decimal
                                var playtime_forever_Results = Math.round(data.owned_games[i].playtime_forever / 60)
                                if (data.owned_games[i].playtime_forever > 6000) {
                                    playtime_forever_Results = Math.round(data.owned_games[i].playtime_forever / 60) + " h"
                                } else if (data.owned_games[i].playtime_forever < 60) {
                                    playtime_forever_Results = data.owned_games[i].playtime_forever + " min"
                                } else {
                                    playtime_forever_Results = Math.round(data.owned_games[i].playtime_forever / 60 * 10) / 10 + " h"
                                }
                                alltimegamestimeplayed.innerHTML = playtime_forever_Results
                                alltimegamestimeplayed.className = "profileGamesAllTime"
                                mostplayedgameslist.appendChild(alltimegamestimeplayed)
                            }
                            // if player is ingame, find img_icon_url and place it in the "playing" category
                            if (ingame_id > 0) {
                                for (let i = 0; i < numberofgamestoshow; i++) {
                                    if (ingame_id === (data.owned_games[i].appid + "")) {
                                        addMyImg(ingame_id, data.owned_games[i].img_icon_url, ingame_name)
                                        break
                                    }
                                }
                            }
                        }
                    })
                    ownedgamesLoaded = true;
                }).catch(() => {
                    mostplayedgameslist.innerHTML = "Games are not available."
                    ownedgamesLoaded = true;
                })

                fetch('/steam/recentlyplayed?steamid=' + steamID).then((response) => {
                    response.json().then((data) => {
                        if (data.error) {
                            gameHistoryGrid.innerHTML = data.error
                            loadingEffect("off", "leftcontent");
                        } else {
                            gameHistoryGrid.innerHTML = ""
                            var games = data.games
                            var leftContentHeader = document.createElement("DIV")
                            leftContentHeader.innerHTML = "Game time last 2 weeks:"
                            leftContentHeader.id = "leftContentHeader"
                            gameHistoryGrid.appendChild(leftContentHeader)
                            loadingEffect("off", "leftcontent");
                            for (let i = 0; i < games.length; i++) {
                                var addGameHistory = document.createElement("DIV")
                                addGameHistory.className = "gameHistoryNames"
                                addGameHistory.innerHTML = (i + 1) + ". " + games[i].name
                                document.getElementById("gameHistoryGrid").appendChild(addGameHistory)

                                var addGameHistoryTime = document.createElement("DIV")
                                addGameHistoryTime.className = "gameHistoryTimes"
                                var gameHistoryTime;
                                if (games[i].playtime_2weeks > 60) {
                                    gameHistoryTime = Math.round(games[i].playtime_2weeks * 10 / 60) / 10
                                    addGameHistoryTime.innerHTML = gameHistoryTime + " hours"
                                } else {
                                    gameHistoryTime = games[i].playtime_2weeks
                                    addGameHistoryTime.innerHTML = gameHistoryTime + " min"
                                }
                                document.getElementById("gameHistoryGrid").appendChild(addGameHistoryTime)
                            }
                        }
                    })
                    recentlyPlayedLoaded = true;
                }).catch(() => {
                    gameHistoryGrid.innerHTML = "Could not find Steam User. Try again."
                    recentlyPlayedLoaded = true;
                    loadingEffect("off", "leftcontent");
                })
                // friendlist stuffs
                fetch('/steam/friendlist?steamid=' + steamID).then((response) => {
                    response.json().then((data) => {
                        if (data.error) {
                            if (data.hidden == "true") {
                                friendlistUser.innerHTML = "<div style=\"padding: 20px;\">Friends unavailable</div>";
                                // confirm friendlist script is finished
                                friendlistLoaded = true;
                                loadingEffect("off", "friends");
                                loadingEffect("off", "searchbar");
                            } else {
                                console.log("Error occured, user is not hidden. >check code line<")
                                friendlistUser.textContent = data.error;
                                loadingEffect("off", "friends");
                                loadingEffect("off", "searchbar");
                            }
                        } else {
                            friendids = data.friendids
                            friendnames = data.friendnames
                            friendAvatars = data.friendAvatars
                            loadingEffect("off", "friends");
                            // friendlistUser.innerHTML = "<div id=\"friendlistResultUser\"><b>" + data.steamusername + "</b> friendlist: <br>(" + data.friendids.length + "x)<button class=\"push_btns\" id=\"hideFriendList-Btn\" onclick=\"hideFriendList()\">Hide</button></div>";
                            friendlistUser.innerHTML = "<button class=\"push_btns\" id=\"hideFriendList-Btn\" onclick=\"hideFriendList()\">Hide</button>";
                            friendlistResults.innerHTML = "<div id=\"friendAmount\">Friends: " + data.friendids.length + "</div>";
                            for (let i = 0; i < data.friendids.length; i++) {
                                setTimeout(() => {
                                    friendlistResults.innerHTML += '<img class="friendListAvatar" src=' + data.friendAvatars[i] + ' alt="avatar" style="width:32px;height:32px;" onerror="this.onerror=null;this.src=' + setAvatarMedium + ';">'
                                    friendlistResults.innerHTML += "<button onclick=\"friendResultNum(" + i + ")\" id=\"friendResultNum" + i + "\" class=\"friendListResults\">" + data.friendnames[i] + "</button>"
                                    if (data.friendids.length - 1 === i) {
                                        // make the last loop call confirm => friendlistLoaded = true. This avoids the friendlist being filled more than 1 time if search btn spammed.
                                        friendlistLoaded = true;
                                        // stop loading when last friend is added
                                        loadingEffect("off", "searchbar");
                                    }
                                }, 0)
                            }
                            hideFriendList(true);
                        }
                    })
                }).catch(() => {
                    friendlistResults.innerHTML = "Could not find Steam User. Try again."
                    friendlistLoaded = true;
                    loadingEffect("off", "friends");
                    loadingEffect("off", "searchbar");
                })
            }
            getuserLoaded = true;
        })
    }).catch(() => {
        mostplayedgameslist.innerHTML = "Games are not available."
        getuserLoaded = true;
        friendlistLoaded = true;
        recentlyPlayedLoaded = true;
        ownedgamesLoaded = true;
        loadingEffect("off", "leftcontent");
        loadingEffect("off", "profile");
        loadingEffect("off", "friends");
        loadingEffect("off", "searchbar");
    })
})


var friendlistVisible = false;
hideFriendList = (forceShow) => {
    if (friendlistVisible || forceShow) {
        document.querySelector("#friendlist-output").style.display = "grid"
        document.querySelector("#friendlist-block").style.height = "fit-content"
        friendlistVisible = false
        document.getElementById("hideFriendList-Btn").innerHTML = "Hide"
    } else {
        document.querySelector("#friendlist-output").style.display = "none"
        document.querySelector("#friendlist-block").style.height = "80px"
        friendlistVisible = true
        document.getElementById("hideFriendList-Btn").innerHTML = "Show"
    }
}


friendResultNum = (friendNumberFromList) => {
    document.getElementById("steamIDinputfield").value = friendids[friendNumberFromList]
    // Scroll To Top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // animate searchfield with a faint blinking color
    searchFieldBlinkEffect();
}







function addMyImg(gameid, imgUrl, gamename) {
    document.getElementById("profileIngame").innerHTML = ""
    var gameImage = document.createElement("IMG")
    gameImage.setAttribute('src', 'http://media.steampowered.com/steamcommunity/public/images/apps/' + gameid + '/' + imgUrl + '.jpg');
    gameImage.style.height = "18px"
    gameImage.style.width = "18px"
    document.getElementById("profileIngame").appendChild(gameImage)
    document.getElementById("profileIngame").innerHTML += " " + gamename
}






document.getElementById("navbar_user_info").addEventListener("click", () => {
    navbar_go_to("user profile");
})

document.getElementById("navbar_help").addEventListener("click", () => {
    navbar_go_to("help")
})

document.getElementById("navbar_about").addEventListener("click", () => {
    navbar_go_to("about")
})

var help_is_visible = false;
var userfound = true;

navbar_go_to = (navbar_option) => {
    highlight_selected_navbar_item = (id_of_selected_navbar_item) => {
        document.getElementById("navbar_user_info").classList.remove("navbar_active")
        document.getElementById("navbar_help").classList.remove("navbar_active")
        document.getElementById("navbar_about").classList.remove("navbar_active")
        // add highlight class to selected navbar item (id in parameter)
        document.getElementById(id_of_selected_navbar_item).classList.add("navbar_active")
    }
    // hide all
    document.getElementById("help_centerContent").style.display = "none"
    document.getElementById("about_centerContent").style.display = "none"
    loadingScreen.style.display = "none"
    mainScreen.style.display = "none"

    document.getElementById("searchbar").style.display = "none"

    if (navbar_option === "user profile") {
        highlight_selected_navbar_item("navbar_user_info");
        // show searchbar
        document.getElementById("searchbar").style.display = "block"

        if (startscreen_visible === "page_loaded" && userfound === true) {
            loadingScreen.style.display = "block"
        } else if (userfound === true) {
            mainScreen.style.display = "grid"
        } else if (userfound === false) {
            // show user data
            loadingScreen.style.display = "block"
        }
    } else if (navbar_option === "help") {
        highlight_selected_navbar_item("navbar_help");
        // show help
        document.getElementById("help_centerContent").style.display = "block"
    } else if (navbar_option === "about") {
        highlight_selected_navbar_item("navbar_about");
        // show about
        document.getElementById("about_centerContent").style.display = "block"
    }
}

/*
navbar_go_to("user profile")

navbar_go_to("help")

navbar_go_to("about")
*/




























var help_find_steamid_visible = false;

function showhelp_steps_steamid() {
    if (help_find_steamid_visible) {
        help_find_steamid_visible = false;
        document.querySelector("#help_find_steamid_one").style.display = "none"
        document.querySelector("#help_find_steamid_two").style.display = "none"
    } else {
        help_find_steamid_visible = true;
        document.querySelector("#help_find_steamid_one").style.display = "flex"
        document.querySelector("#help_find_steamid_two").style.display = "flex"
    }
}


var help_steps_visible = false;

function showhelp_steps_visibilityStatus() {
    if (help_steps_visible) {
        help_steps_visible = false;
        document.querySelector("#help_find_privacy_settings_one").style.display = "none"
        document.querySelector("#help_find_privacy_settings_two").style.display = "none"
        document.querySelector("#help_find_privacy_settings_three").style.display = "none"
    } else {
        help_steps_visible = true;
        document.querySelector("#help_find_privacy_settings_one").style.display = "flex"
        document.querySelector("#help_find_privacy_settings_two").style.display = "flex"
        document.querySelector("#help_find_privacy_settings_three").style.display = "flex"
    }
}






function showSampleUsers() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('#dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
    // Need this so it wont close down. So sloppy...
    if (event.target.matches('#uniqueIDfirst')) {
        document.getElementById("myDropdown").classList.toggle("show");
    }
}





// navbar_go_to("help")


/*


Features to add reminder

✓ navbar highlight when selected.
✓ all time games unavailable => remove instead of displaying message
✓ add scrollbar to most played games. (if list is long enough ofcourse)
-> explain the sample users button?             Do it in help aswell!!!!
if player offline => display last logoff
visibility state? is it worth it?
friendlist, make names and avatars into the same block
-> add about page, explain the projects purpose and why you are doing this



*/

