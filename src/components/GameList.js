import React from 'react';
import { Card, CardGroup, Button, ProgressBar } from 'react-bootstrap';
import { MDBInput } from 'mdbreact';
import '../css/gamedisplay.css';

class GameList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            games: [],
            gamesInSet: [],
            error: null,
            team1score: null,
            team2score: null,
            gameID: "",
            pickedTeam: "",
            unpickedTeam: "",
            sets: [],
            setNum: 0,
            userID: "",
            teamID: "",
            voted: "",
            usergames: [],
            roleID: ""
        };

        this.handleSelect = this.handleSelect.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.createGameGroups = this.createGameGroups.bind(this);
        this.handleProfileGet = this.handleProfileGet.bind(this);
        this.checkExpiredMatch = this.checkExpiredMatch.bind(this);
        this.checkVotedMatch = this.checkVotedMatch.bind(this);
        this.checkVoted = this.checkVoted.bind(this);
        this.getUserGame = this.getUserGame.bind(this);
        this.inputChanged = this.inputChanged.bind(this);
        this.decrease = this.decrease.bind(this);
        this.increase = this.increase.bind(this);
    }

    async componentDidMount() {
        var gameList = this.props.games;
        var sortedGames = gameList.sort((a, b) => new Date(a.gamedate) - new Date(b.gamedate));
        this.setState({ games: sortedGames, setNum: this.props.setNum });
        this.handleProfileGet();
        this.getUserGame();
        await this.createGameGroups();
        this.checkVotedMatch();
        this.checkExpiredMatch();
    }

    componentDidUpdate() {
        this.checkExpiredMatch();
    }

    decrease(votedteam,i){
        var votedscore = votedteam + i + this.state.setNum;
        if(document.getElementById(votedscore).placeholder == ''){
            document.getElementById(votedscore).placeholder = 0;
        }else if(document.getElementById(votedscore).value == ''){
            document.getElementById(votedscore).value = parseInt(document.getElementById(votedscore).placeholder) - 1;
            if(document.getElementById(votedscore).value <= 0){
                document.getElementById(votedscore).value = 0;
            }
        }else{
            document.getElementById(votedscore).value = parseInt(document.getElementById(votedscore).value) - 1;
            if(document.getElementById(votedscore).value <= 0){
                document.getElementById(votedscore).value = 0;
            }
        }
        console.log(document.getElementById(votedscore).value)
        this.inputChanged(i, i);
    }

    increase(votedteam, i){        
        var votedscore = votedteam + i + this.state.setNum;
        if(document.getElementById(votedscore).placeholder == ''){
            document.getElementById(votedscore).placeholder = 0;
        }else if(document.getElementById(votedscore).value == ''){
            document.getElementById(votedscore).value = parseInt(document.getElementById(votedscore).placeholder) + 1;
        }else{
            document.getElementById(votedscore).value = parseInt(document.getElementById(votedscore).value) + 1;
        }
        console.log(document.getElementById(votedscore).value)
        this.inputChanged(i, i);
    }

    createGameGroups = () => {
        let cardDisplay = []
        console.log(this.state.games)
        console.log("Create games method in subcomponent: GameList")
        for (let i = 0; i < this.state.games.length; i++) {
            let children = []
            var team1 = 'teama' + i + this.state.setNum;
            var team2 = 'teamb' + i + this.state.setNum;
            var lockbtn = 'lock' + i + this.state.setNum;
            var progress = 'progress' + i + this.state.setNum;
            var score1 = 'score1' + i + this.state.setNum;
            var score2 = 'score2' + i + this.state.setNum;
            var votedscore1 = 'votedscore1' + i + this.state.setNum;
            var votedscore2 = 'votedscore2' + i + this.state.setNum;
            var scoreinputdiv1 = 'scoreinputdiv1' + i + this.state.setNum;
            var scoreinputdiv2 = 'scoreinputdiv2' + i + this.state.setNum;
            var totalTeamPicks = this.state.games[i].team1picks + this.state.games[i].team2picks
            var team1Percent = ((this.state.games[i].team1picks / totalTeamPicks) * 100).toFixed(2)
            var team2Percent = ((this.state.games[i].team2picks / totalTeamPicks) * 100).toFixed(2)
            var preFormattedDate = new Date(this.state.games[i].gamedate)
            var currentGameDate = new Date(preFormattedDate).toISOString().slice(0, 16).replace('T', ' ')

            if (isNaN(team1Percent)) {
                team1Percent = 0;
            }
            if (isNaN(team2Percent)) {
                team2Percent = 0;
            }
            if (team1Percent == 0 && team2Percent == 0) {
                team1Percent = 50;
                team2Percent = 50;
            }

            children.push(
                <Card className="leftTeam" id={i + "team1game"} key={i + "team1score"}>
                    <Card.Body>
                        <Card.Title className="teamTitle">{this.state.games[i].t1_teamName}</Card.Title>
                        <Card.Text id={score1} className="displayNone">{this.state.games[i].team1score}</Card.Text>
                        {/* <Card.Text><input placeholder={this.state.games[i].scorepick1} id={votedscore1} className="displayNone scoreVote" type='number' min='0' onChange={(e) => this.inputChanged(e, i)} /></Card.Text> */}
                        <Card.Text>
                        <div className="def-number-input number-input displayNone" id={scoreinputdiv1}>
                            <button onClick={(e) => this.decrease('votedscore1',i)}>-</button>
                            <input className="quantity scoreVote" id={votedscore1}
                            type="number" placeholder={this.state.games[i].scorepick1} min='0' onChange={(e) => this.inputChanged(e, i)}/>
                            <button onClick={(e) => this.increase('votedscore1',i)}>+</button>
                        </div>
                        </Card.Text>
                        {/* <Button className="cardButton" onClick={(e) => this.handleSelect(e, i)} value={this.state.games[i].team1ID} id={team1}>Vote</Button> */}
                    </Card.Body>
                </Card>
            )
            children.push(
                <Card className="versusCard" id={i + "versusgame"} key={i + "gamedate"}>
                    <Card.Body>
                        <Card.Title>vs</Card.Title>
                        <Card.Text>{currentGameDate}</Card.Text>
                    </Card.Body>
                    <ProgressBar id={progress}>
                        <ProgressBar animated variant="info" now={team1Percent} label={`${this.state.games[i].t1_teamName}: ${team1Percent}%`} key={1} />
                        <ProgressBar animated variant="warning" now={team2Percent} label={`${this.state.games[i].t2_teamName}: ${team2Percent}%`} key={2} />
                    </ProgressBar>
                    {this.state.roleID === 2 &&
                    <Card.Text>Game ID: {this.state.games[i].gameID}</Card.Text> }                    
                    <Card.Footer><Button className="cardButton" id={lockbtn} onClick={(e) => this.handleConfirm(e, i, this.state.games[i].pick)}>Lock Choice</Button></Card.Footer>
                </Card>
            )
            children.push(
                <Card className="rightTeam" id={i + "team2game"} key={i + "team2score"}>
                    <Card.Body>
                        <Card.Title className="teamTitle">{this.state.games[i].t2_teamName}</Card.Title>
                        <Card.Text id={score2} className="displayNone">{this.state.games[i].team2score}</Card.Text>
                        <Card.Text>
                        <div className="def-number-input number-input displayNone" id={scoreinputdiv2}>
                            <button onClick={(e) => this.decrease('votedscore2',i)}>-</button>
                            <input className="quantity scoreVote" id={votedscore2}
                            type="number" placeholder={this.state.games[i].scorepick2} min='0' onChange={(e) => this.inputChanged(e, i)}/>
                            <button onClick={(e) => this.increase('votedscore2',i)}>+</button>
                        </div>
                        </Card.Text>
                        {/* <Button className="cardButton" onClick={(e) => this.handleSelect(e, i)} value={this.state.games[i].team2ID} id={team2}>Vote</Button> */}
                    </Card.Body>
                </Card>
            )

            var date = new Date();
            var utcDate = new Date(date.toUTCString());
            utcDate.setHours(utcDate.getHours()-7);
            var usWestDate = new Date(utcDate);

            if (usWestDate > new Date(this.state.games[i].gamedate)) {
                cardDisplay.push(<CardGroup className="pastGame" key={i}>{children}</CardGroup>);
            } else {
                cardDisplay.push(<CardGroup className="currentGame" text="white" key={i}>{children}</CardGroup>);
            }
        }
        return cardDisplay
    }

    checkVotedMatch() {
        for (let i = 0; i < this.state.games.length; i++) {
            var team1 = 'teama' + i + this.state.setNum;
            var team2 = 'teamb' + i + this.state.setNum;
            var lockbtn = 'lock' + i + this.state.setNum;
            var voteBtn1 = document.getElementById(team1);
            var voteBtn2 = document.getElementById(team2);

            document.getElementById(lockbtn).disabled = true;

            // if (this.state.games[i].voted) {
            //     if (this.state.games[i].pick == voteBtn1.value) {
            //         voteBtn1.disabled = true;
            //         voteBtn2.disabled = false;
            //     } else if (this.state.games[i].pick == voteBtn2.value) {
            //         voteBtn2.disabled = true;
            //         voteBtn1.disabled = false;
            //     }
            // }
        }
    }

    checkExpiredMatch() {
        for (let i = 0; i < this.state.games.length; i++) {
            var team1 = 'teama' + i + this.state.setNum;
            var team2 = 'teamb' + i + this.state.setNum;
            var lockbtn = 'lock' + i + this.state.setNum;
            var progress = 'progress' + i + this.state.setNum;
            var score1 = 'score1' + i + this.state.setNum;
            var score2 = 'score2' + i + this.state.setNum;
            var votedscore1 = 'votedscore1' + i + this.state.setNum;
            var votedscore2 = 'votedscore2' + i + this.state.setNum;           
            var scoreinputdiv1 = 'scoreinputdiv1' + i + this.state.setNum; 
            var scoreinputdiv2 = 'scoreinputdiv2' + i + this.state.setNum;
            // var voteBtn1 = document.getElementById(team1);
            // var voteBtn2 = document.getElementById(team2);

            var date = new Date();
            var utcDate = new Date(date.toUTCString());
            utcDate.setHours(utcDate.getHours()-7);
            var usWestDate = new Date(utcDate);

            if (usWestDate > new Date(this.state.games[i].gamedate)) {
                // voteBtn1.classList.add("displayNone");
                // voteBtn2.classList.add("displayNone");
                document.getElementById(lockbtn).classList.add("displayNone");
                document.getElementById(votedscore1).classList.add("displayNone");
                document.getElementById(votedscore2).classList.add("displayNone");
                document.getElementById(scoreinputdiv1).classList.add("displayNone");
                document.getElementById(scoreinputdiv2).classList.add("displayNone");
                document.getElementById(score1).classList.remove("displayNone");
                document.getElementById(score2).classList.remove("displayNone");
            } else {
                document.getElementById(lockbtn).classList.remove("displayNone");
                document.getElementById(votedscore1).classList.remove("displayNone");
                document.getElementById(votedscore2).classList.remove("displayNone");
                document.getElementById(scoreinputdiv1).classList.remove("displayNone");
                document.getElementById(scoreinputdiv2).classList.remove("displayNone");
                document.getElementById(score1).classList.add("displayNone");
                document.getElementById(score2).classList.add("displayNone");
            }
        }
    }

    handleSelect(e, i) {
        e.preventDefault();
        var team1 = 'teama' + i + this.state.setNum;
        var team2 = 'teamb' + i + this.state.setNum;
        var lockbtn = 'lock' + i + this.state.setNum;
        this.setState({ gameID: this.state.games[i].gameID });

        if (e.target.id == team1) {
            document.getElementById(team1).disabled = true;
            document.getElementById(team2).disabled = false;
            console.log("team A handleSelect")
            this.setState({ teamID: e.target.value })

        } else if (e.target.id == team2) {
            document.getElementById(team1).disabled = false;
            document.getElementById(team2).disabled = true;
            console.log('team B handleSelect')
            this.setState({ teamID: e.target.value })
        } else {
            console.log('Team not found')
        }

        if (this.state.games[i].pick != e.target.value) {
            document.getElementById(lockbtn).disabled = false;
        } else {
            document.getElementById(lockbtn).disabled = true;
        }
    }

    inputChanged(e, i) {
        var votedscore1 = 'votedscore1' + i + this.state.setNum;
        var votedscore2 = 'votedscore2' + i + this.state.setNum;
        var lockbtn = 'lock' + i + this.state.setNum;
        var score1input = document.getElementById(votedscore1);
        var score2input = document.getElementById(votedscore2);

        if (score1input.value.length < 1 && score2input.value.length < 1) {
            console.log("empty input")
            document.getElementById(lockbtn).disabled = true;
        }
        if (score1input.value != this.state.games[i].scorepick1 || score2input.value != this.state.games[i].scorepick2) {
            console.log("diff input", score1input.value, this.state.games[i].scorepick1)
            document.getElementById(lockbtn).disabled = false;
        }
        if (score1input.value == this.state.games[i].scorepick1 && score2input.value == this.state.games[i].scorepick2) {
            console.log("same input")
            document.getElementById(lockbtn).disabled = true;
        }        
        if (score1input.value == this.state.games[i].scorepick1 && score2input.value.length < 1) {
            console.log("1 no change")
            document.getElementById(lockbtn).disabled = true;
        }
        if (score2input.value == this.state.games[i].scorepick2 && score1input.value.length < 1) {
            console.log("2 no change")
            document.getElementById(lockbtn).disabled = true;
        }
    }

    handleConfirm(e, i, dbPick) {
        e.preventDefault();
        var team1 = 'teama' + i + this.state.setNum;
        var team2 = 'teamb' + i + this.state.setNum;
        var lockbtn = 'lock' + i + this.state.setNum;
        var votedscore1 = 'votedscore1' + i + this.state.setNum;
        var votedscore2 = 'votedscore2' + i + this.state.setNum;
        var pickedscore1 = document.getElementById(votedscore1).value;
        var pickedscore2 = document.getElementById(votedscore2).value;

        if (pickedscore1 === '' && this.state.games[i].scorepick1 !== null) {
            console.log("set score1 default")
            pickedscore1 = this.state.games[i].scorepick1;
        } else if (pickedscore1 === '') {
            console.log("set score1 0")
            pickedscore1 = 0;
        }
        if (pickedscore2 === '' && this.state.games[i].scorepick2 !== null) {
            console.log("set score2 default")
            pickedscore2 = this.state.games[i].scorepick2;
        } else if (pickedscore2 === '') {
            console.log("set score2 0")
            pickedscore2 = 0;
        }

        document.getElementById(lockbtn).disabled = true;
        this.setState({ gameID: this.state.games[i].gameID })
        if (pickedscore1 > pickedscore2) {
            console.log("Team a voted for", this.state.games[i].team1ID)
            this.setState({
                pickedTeam: "team1picks",
                unpickedTeam: "team2picks",
                teamID: this.state.games[i].team1ID
            })
        } else if (pickedscore1 < pickedscore2) {
            console.log("Team b voted for", this.state.games[i].team2ID)
            this.setState({
                pickedTeam: "team2picks",
                unpickedTeam: "team1picks",
                teamID: this.state.games[i].team2ID
            })
        } else {
            console.log("Picked team not found")
        }
        // if (document.getElementById(team1).disabled == true) {
        //     console.log("Team a voted for")
        //     this.setState({
        //         pickedTeam: "team1picks",
        //         unpickedTeam: "team2picks",
        //         teamID: document.getElementById(team1).value
        //     })
        // } else if (document.getElementById(team2).disabled == true) {
        //     console.log("Team b voted for")
        //     this.setState({
        //         pickedTeam: "team2picks",
        //         unpickedTeam: "team1picks",
        //         teamID: document.getElementById(team2).value
        //     })
        // } else {
        //     console.log("Picked team not found")
        // }

        setTimeout(function () {
            var data = {
                gameID: this.state.gameID,
                pickedTeam: this.state.pickedTeam,
                userID: this.state.userID,
                teamID: this.state.teamID,
                voted: this.state.voted,
                unpickedTeam: this.state.unpickedTeam,
                scorepick1: pickedscore1,
                scorepick2: pickedscore2
            }
            console.log(data)

            this.state.games[i].pick = this.state.teamID;
            console.log("pick ", data.teamID, dbPick, data.teamID != dbPick, data.teamID)
            if (data.teamID != dbPick && data.teamID > 0) {
                if (!this.checkVoted(this.state.gameID, this.state.userID)) {
                    console.log("first vote")
                    console.log("vote with game pick")
                    fetch("/games/api/increaseteampicks", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    }).then(function (response) {
                        if (response.status >= 400) {
                            throw new Error("Bad response from server");
                        }
                        return response.json();
                    }).then(function (data) {
                        console.log(data)
                    }).catch(function (err) {
                        console.log(err)
                    });

                    this.state.games[i].voted = 1;
                }
                else {
                    console.log("change vote")
                    fetch("/games/api/changevote", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    }).then(function (response) {
                        console.log(response);
                        if (response.status >= 400) {
                            throw new Error("Bad response from server");
                        }
                        return response.json();
                    }).then(function (data) {
                        console.log(data)
                    }).catch(function (err) {
                        console.log(err)
                    });
                }
            } else if (dbPick == null && data.teamID < 1) {
                if (!this.checkVoted(this.state.gameID, this.state.userID)) {
                    console.log("first vote")
                    console.log("vote with NO game pick")
                    fetch("/games/api/createvote", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    }).then(function (response) {
                        if (response.status >= 400) {
                            throw new Error("Bad response from server");
                        }
                        return response.json();
                    }).then(function (data) {
                        console.log(data)
                    }).catch(function (err) {
                        console.log(err)
                    });

                    this.state.games[i].voted = 1;
                }
            }
            console.log("changed score")
            fetch("/games/api/changescore", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(function (response) {
                if (response.status >= 400) {
                    throw new Error("Bad response from server");
                }
                return response.json();
            }).then(function (data) {
                console.log(data)
            }).catch(function (err) {
                console.log(err)
            });
            this.state.games[i].voted = 1;

        }.bind(this), 1000);
    }

    handleProfileGet() {
        console.log("Session ID from storage: " + localStorage.getItem('sessionID'));
        fetch(`/users/api/LoggedIn?sessionID=${encodeURIComponent(localStorage.getItem('sessionID'))}`, {
            method: 'GET'
        })
            .then(response => {
                if (response.status == 200) return response.json()
            })
            .then(post => {
                console.log(post.userID);
                this.setState({ userID: post.userID, roleID: post.roleID });
            }) //get json
            .catch(err => { console.log(err); }); //catch any errors
    }

    getUserGame() {
        console.log("get users");
        fetch("/games/api/getusergame")
            .then(response => response.json())
            .then(state => this.setState({ usergames: state }, () => {
            }));
    }

    checkVoted(gameID, userID) {
        console.log("check vote: gameID ", gameID, " userID ", userID)
        for (let i = 0; i < this.state.usergames.length; i++) {
            if (this.state.usergames[i].gameID == gameID && this.state.usergames[i].userID == userID) {
                return true;
            }
        }
        return false;
    }

    render() {
        return (
            <div className="container">
                {this.createGameGroups()}
            </div>
        );
    }
}
export default GameList;
