import React, { Component } from 'react';
import { Tabs, Tab, Button, Modal } from 'react-bootstrap';
import GameList from './GameList';
import '../css/gamedisplay.css';
import '../App.css';

class GameDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            games: [],
            gamesInSet: [],
            sets: [],
            userID: '',
            show: false
        };

        this.getGames = this.getGames.bind(this);
        this.handleProfileGet = this.handleProfileGet.bind(this);
        this.redirect = this.redirect.bind(this);
    }

    componentDidMount() {
        this.setState({ loading: true });
        document.getElementById("GameDisplay").classList.add('activeTab');
        this.handleProfileGet();
        if (this.state.userID == 0) {
            this.setState({ show: true })
        }
    }

    componentWillUnmount(){
        document.getElementById("GameDisplay").classList.remove('activeTab');
    }

    handleProfileGet() {
        fetch(`/users/api/LoggedIn?sessionID=${encodeURIComponent(localStorage.getItem('sessionID'))}`, {
            method: 'GET'
        })
            .then(response => {
                if (response.status == 200) return response.json()
                else {
                    this.setState({ userID: 0 })
                }
            })
            .then(post => {
                this.setState({ userID: post.userID });
                this.getGames();
            }) //get json
            .catch(err => { console.log(err); }); //catch any errors
    }

    getGames() {

        fetch("/games/api/getusergames/" + this.state.userID)
            .then(response => response.json())
            .then(state => this.setState({ games: state }, () => {
                this.setState({ loading: false });

                let gameSets = new Set();
                for (let i = 0; i < this.state.games.length; i++) {
                    if (this.state.games[i].set != null) {
                        gameSets.add(this.state.games[i].set);
                    }
                }

                let arraySets = [];
                arraySets = Array.from(gameSets);
                arraySets = arraySets.sort((a, b) => a - b);
                this.setState({ sets: arraySets });
            }));
    }

    // Populate Game tabs
    createGameTabs() {
        let children = [];
        let gamesOfSet = [];

        for (let i = 0; i < this.state.sets.length; i++) {
            let gamesInSet = [];
            for (let j = 0; j < this.state.games.length; j++) {
                if (this.state.games[j].set === this.state.sets[i]) {
                    gamesInSet.push(this.state.games[j]);
                }
            }

            gamesOfSet.push(gamesInSet);

            children.push(<Tab key={this.state.sets[i] + i} eventKey={this.state.sets[i] + i} title={"Week " + this.state.sets[i]}>
                <GameList setNum={this.state.sets[i]} games={gamesOfSet[i]}></GameList>
            </Tab>);
        }
        return children;
    }

    // Redirect to Login page
    redirect() {
        let path = `/User/Login`;
        this.props.history.push(path);
    }

    render() {

        if (this.state.userID === 0) {
            return (
                <div>
                    <Modal show={this.state.show} onHide={this.redirect}>
                        <Modal.Header closeButton>
                            <Modal.Title>Not Logged In</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Please login to view games!</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={this.redirect}>
                                Ok
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            );
        }

        if (this.state.loading) {
            return <div>Loading Games...</div>
        }

        return (
            <div>
                <Tabs fill activeKey={this.state.key} onSelect={key => this.setState({ key })}>
                    {this.createGameTabs()}
                </Tabs>
            </div>
        );
    }
}

export default GameDisplay;