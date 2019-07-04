import React, { Component } from 'react';
import DateTimePicker from 'react-datetime-picker';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team1Score: '',
      team2Score: '',
      gamedate: null,
      teamName: '',
      wins: '',
      losses: '',
      games: [],
      teams: [],
      team1ID: '',
      team2ID: '',
      set: '',
      gameID: '',
      winTeamID: '',
      loseTeamID: '',
      delTeamID: '',
      delGameID: '',
      users: [],
      usergames: [],
      selectedTeamName1: 'Select Team 1',
      selectedTeamName2: 'Select Team 2',
      selectedWinTeam: 'Select Team',
      selectedLoseTeam: 'Select Team',
      selectedDelTeam: 'Select Team',
      delDate: null
    };
    this.submitGame = this.submitGame.bind(this);
    this.setScore1 = this.setScore1.bind(this);
    this.setScore2 = this.setScore2.bind(this);
    this.setDate = this.setDate.bind(this);
    this.submitTeam = this.submitTeam.bind(this);
    this.setTeamName = this.setTeamName.bind(this);
    this.setWins = this.setWins.bind(this);
    this.setLosses = this.setLosses.bind(this);
    this.getGames = this.getGames.bind(this);
    this.getTeams = this.getTeams.bind(this);
    this.setTeam1 = this.setTeam1.bind(this);
    this.setTeam2 = this.setTeam2.bind(this);
    this.setSet = this.setSet.bind(this);
    this.setGameID = this.setGameID.bind(this);
    this.submitScore = this.submitScore.bind(this);
    this.submitWins = this.submitWins.bind(this);
    this.submitLosses = this.submitLosses.bind(this);
    this.setWinTeamID = this.setWinTeamID.bind(this);
    this.setLoseTeamID = this.setLoseTeamID.bind(this);
    this.setDelTeamID = this.setDelTeamID.bind(this);
    this.deleteTeam = this.deleteTeam.bind(this);
    this.setDelGameID = this.setDelGameID.bind(this);
    this.deleteGame = this.deleteGame.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getUserGame = this.getUserGame.bind(this);
    this.deleteByDate = this.deleteByDate.bind(this);
    this.setDelDate = this.setDelDate.bind(this);
  }

  //When page has loaded run game get
  async componentDidMount() {
    this.getGames();
    this.getTeams();

    document.getElementById("Admin").classList.add('activeTab');
  }

  getGames(event) {
    console.log("get games");
    fetch("/games/api/getgames")
      .then(response => response.json())
      .then(state => this.setState({ games: state }, () => {
        console.log(this.state.games, 'games');
      }));
  }

  getTeams(event) {
    console.log("get teams");
    fetch("/teams/api/getteams")
      .then(response => response.json())
      .then(state => this.setState({ teams: state }, () => {
        console.log(this.state.teams, 'teams');
        let arraySets = [];
        arraySets = Array.from(this.state.teams);
        arraySets = arraySets.sort(function(a, b){
          if(a.teamName < b.teamName) { return -1; }
          if(a.teamName > b.teamName) { return 1; }
          return 0;});
        this.setState({ teams: arraySets });
      }));
  }

  getUsers(event) {
    event.preventDefault();
    console.log("get users");
    fetch("/games/api/getuser")
      .then(response => response.json())
      .then(state => this.setState({ users: state }, () => {
        console.log(this.state.users, 'users');
      }));
  }

  getUserGame(event) {
    event.preventDefault();
    console.log("get users");
    fetch("/games/api/getusergame")
      .then(response => response.json())
      .then(state => this.setState({ usergames: state }, () => {
        console.log(this.state.usergames, 'usergames');
      }));
  }

  // Add a new Game
  submitGame(event) {
    event.preventDefault()
    var data = {
      team1ID: this.state.team1ID,
      team2ID: this.state.team2ID,
      gamedate: this.state.gamedateoutput,
      set: this.state.set,
    }
    this.setState({ team1ID: '' })
    this.setState({ team2ID: '' })
    this.setState({ set: '' })
    this.setState({ gamedate: '' })
    this.setState({ gamedateoutput: '' })
    console.log(data)
    fetch("/games/api/newgame", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      let item = response.json();
      console.log(item);
      return item;
    }).then(function (data) {
      console.log(data)
      alert("Game added!")
    }).catch(function (err) {
      console.log(err)
      alert("Unable to add game!")
    });
  }

  // Add a new Team
  submitTeam(event) {
    event.preventDefault()
    var data = {
      teamName: this.state.teamName,
    }
    this.setState({ teamName: '' })
    console.log(data)
    fetch("/teams/api/newteam", {
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
      alert("Team added!")
    })
      .catch(function (err) {
        console.log(err)
        alert("Unable to add team!")
      });
  }

  // Update Scores for completed Games
  submitScore(event) {
    event.preventDefault()
    var data = {
      gameID: this.state.gameID,
      team1Score: this.state.team1Score,
      team2Score: this.state.team2Score,
    }
    this.setState({ gameID: '' })
    this.setState({ team1Score: '' })
    this.setState({ team2Score: '' })
    console.log(data)
    fetch("/games/api/addteamscore", {
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
      alert("Scores added!")
    }).catch(function (err) {
      console.log(err)
      alert("Unable to add scores!")
    });
  }

  // Update Wins for specific Teams
  submitWins(event) {
    event.preventDefault()
    var data = {
      winTeamID: this.state.winTeamID,
      wins: this.state.wins
    }
    this.setState({ winTeamID: '' })
    this.setState({ wins: '' })
    console.log(data)
    fetch("/teams/api/setwins", {
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
      alert("Wins updated!")
    }).catch(function (err) {
      console.log(err)
      alert("Unable to set wins!")
    });
  }

  // Update Losses for specific Teams
  submitLosses(event) {
    event.preventDefault()
    var data = {
      loseTeamID: this.state.loseTeamID,
      losses: this.state.losses
    }
    this.setState({ loseTeamID: '' })
    this.setState({ losses: '' })
    console.log(data)
    fetch("/teams/api/setlosses", {
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
      alert("Losses updated!")
    }).catch(function (err) {
      console.log(err)
      alert("Unable to set losses!")
    });
  }

  deleteTeam(event) {
    event.preventDefault()
    var data = {
      delTeamID: this.state.delTeamID,
    }
    this.setState({ delTeamID: '' })
    console.log(data)
    fetch("/teams/api/deleteteam", {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    }).then(function (data) {
      console.log(data)
      alert("Team deleted!")
    }).catch(function (err) {
      console.log(err)
      alert("Unable to delete team!")
    });
  }

  deleteGame(event) {
    event.preventDefault()
    var data = {
      delGameID: this.state.delGameID,
    }
    this.setState({ delGameID: '' })
    console.log(data)
    fetch("/games/api/deletegame", {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    }).then(function (data) {
      console.log(data)
      alert("Game deleted!")
    }).catch(function (err) {
      console.log(err)
      alert("Unable to delete game!")
    });
  }

  // Delete all Games before a specific date
  deleteByDate(event) {
    event.preventDefault()
    var data = {
      delDate: this.state.delDateOutput,
    }
    this.setState({ delDate: '' })
    this.setState({ delDateOutput: '' })
    console.log(data)
    fetch("/games/api/deletebydate", {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    }).then(function (data) {
      console.log(data)
      alert("Games deleted!")
    }).catch(function (err) {
      console.log(err)
      alert("Unable to delete games!")
    });
  }

  setScore1(e) {
    this.setState({ team1Score: e.target.value });
  }

  setScore2(e) {
    this.setState({ team2Score: e.target.value });
  }

  setDate(e) {
    this.setState({ gamedate: e, gamedateoutput: new Date(e - e.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') });
  }

  setTeamName(e) {
    this.setState({ teamName: e.target.value });
  }

  setWins(e) {
    this.setState({ wins: e.target.value });
  }

  setLosses(e) {
    this.setState({ losses: e.target.value });
  }

  setTeam1(e) {
    this.setState({ team1ID: e.teamID, selectedTeamName1: e.teamName });
  }

  setTeam2(e) {
    this.setState({ team2ID: e.teamID, selectedTeamName2: e.teamName });
  }

  setSet(e) {
    this.setState({ set: e.target.value });
  }

  setGameID(e) {
    this.setState({ gameID: e.target.value });
  }

  setWinTeamID(e) {
    this.setState({ winTeamID: e.teamID, selectedWinTeam: e.teamName })
  }

  setLoseTeamID(e) {
    this.setState({ loseTeamID: e.teamID, selectedLoseTeam: e.teamName })
  }

  setDelTeamID(e) {
    this.setState({ delTeamID: e.teamID, selectedDelTeam: e.teamName })
  }

  setDelGameID(e) {
    this.setState({ delGameID: e.target.value })
  }

  setDelDate(e) {
    this.setState({ delDate: e, delDateOutput: new Date(e - e.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') })
  }

  render() {
    return (
      <div>
        <h1>Admin Page</h1>
        <h2>Add Team</h2>
        <form onSubmit={this.submitTeam}>
          <input type="text" value={this.state.teamName} placeholder="Team Name" onChange={this.setTeamName} required />
          <input type="submit" value="Submit" />
        </form>
        <br />
        <h2>Add Game</h2>
        <form onSubmit={this.submitGame}>
          <ButtonToolbar style={{ 'justify-content': 'center' }}>
            <Dropdown>
              <DropdownButton id="dropdown-team1" variant="success" title={this.state.selectedTeamName1}>
                {this.state.teams.map((team) => <Dropdown.Item onSelect={(e) => this.setTeam1(team)} href="#" key={team.teamID} value={team.teamID} required>{team.teamName}</Dropdown.Item>)}
              </DropdownButton>
            </Dropdown>
            <Dropdown>
              <DropdownButton id="dropdown-team2" variant="success" title={this.state.selectedTeamName2}>
                {this.state.teams.map((team) => <Dropdown.Item onSelect={(e) => this.setTeam2(team)} href="#" key={team.teamID} value={team.teamID} required>{team.teamName}</Dropdown.Item>)}
              </DropdownButton>
            </Dropdown>
          </ButtonToolbar>
          <input type="number" value={this.state.set} placeholder="Set" onChange={this.setSet} required />
          <DateTimePicker onChange={this.setDate} value={this.state.gamedate} required />
          <input type="submit" value="Submit" />
        </form>
        <br />
        <h2>Update Game Score</h2>
        <form onSubmit={this.submitScore}>
          <input type="number" value={this.state.gameID} placeholder="Game ID" onChange={this.setGameID} required />
          <input type="number" value={this.state.team1Score} placeholder="Team 1 Score" onChange={this.setScore1} required />
          <input type="number" value={this.state.team2Score} placeholder="Team 2 Score" onChange={this.setScore2} required />
          <input type="submit" value="Submit" />
        </form>
        <br />
        <h2>Set Team Wins</h2>
        <form onSubmit={this.submitWins}>
          <Dropdown>
            <DropdownButton id="dropdown-win-team" variant="success" title={this.state.selectedWinTeam}>
              {this.state.teams.map((team) => <Dropdown.Item onSelect={(e) => this.setWinTeamID(team)} href="#" key={team.teamID} value={team.teamID} required>{team.teamName}</Dropdown.Item>)}
            </DropdownButton>
          </Dropdown>
          {/* <input type="number" value={this.state.winTeamID} placeholder="Team ID" onChange={this.setWinTeamID} required /> */}
          <input type="number" value={this.state.wins} placeholder="Number of Wins" onChange={this.setWins} required />
          <input type="submit" value="Submit" />
        </form>
        <br />
        <h2>Set Team Losses</h2>
        <form onSubmit={this.submitLosses}>
          <Dropdown>
            <DropdownButton id="dropdown-win-team" variant="success" title={this.state.selectedLoseTeam}>
              {this.state.teams.map((team) => <Dropdown.Item onSelect={(e) => this.setLoseTeamID(team)} href="#" key={team.teamID} value={team.teamID} required>{team.teamName}</Dropdown.Item>)}
            </DropdownButton>
          </Dropdown>
          {/* <input type="number" value={this.state.loseTeamID} placeholder="Team ID" onChange={this.setLoseTeamID} required /> */}
          <input type="number" value={this.state.losses} placeholder="Number of Losses" onChange={this.setLosses} required />
          <input type="submit" value="Submit" />
        </form>
        <br />
        <h2>Delete Game</h2>
        <form onSubmit={this.deleteGame}>
          <input type="number" value={this.state.delGameID} placeholder="Game ID" onChange={this.setDelGameID} required />
          <input type="submit" value="Submit" />
        </form>
        <br />
        <h2>Delete Team</h2>
        <p>(Note: You will not be able to delete a team which has games associated with it)</p>
        <form onSubmit={this.deleteTeam}>
          <Dropdown>
            <DropdownButton id="dropdown-win-team" variant="success" title={this.state.selectedDelTeam}>
              {this.state.teams.map((team) => <Dropdown.Item onSelect={(e) => this.setDelTeamID(team)} href="#" key={team.teamID} value={team.teamID} required>{team.teamName}</Dropdown.Item>)}
            </DropdownButton>
          </Dropdown>
          {/* <input type="number" value={this.state.delTeamID} placeholder="Team ID" onChange={this.setDelTeamID} required /> */}
          <input type="submit" value="Submit" />
        </form>
        <br />
        <h2>Delete All Games Before Date</h2>
        <form onSubmit={this.deleteByDate}>
          <DateTimePicker onChange={this.setDelDate} value={this.state.delDate} required />
          <input type="submit" value="Submit" />
        </form>
        <br />
        {/* <Button onClick={this.getGames}>Get Games</Button>
        <Button onClick={this.getTeams}>Get Teams</Button>
        <Button onClick={this.getUsers}>Get Users</Button>
        <Button onClick={this.getUserGame}>Get UserGame</Button> */}
      </div>
    );
  }
}
export default Admin;
