import React, { Component } from 'react';
import '../css/leaderboard.css';
const mdbreact = require('mdbreact');
const { MDBDataTable } = mdbreact;

class Leaderboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            leaderboard: [],
            data: {}
        };
    }

    async componentDidMount() {
        this.setState({ loading: true });
        this.getLeaderboard();
        document.getElementById("Leaderboard").classList.add('activeTab');
    }

    getLeaderboard() {
        console.log("get leaderboard api called");
        fetch("/users/api/getleaderboard")
            .then(response => response.json())
            .then(state => this.setState({ leaderboard: state }, () => {
                this.setState({ loading: false });
                console.log(this.state.leaderboard);
                this.setLeaderboard();
            }));
    }

    setLeaderboard() {
        this.setState({
            data: {
                columns: [
                    {
                        label: 'Rank',
                        field: 'rank',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'Username',
                        field: 'username',
                        sort: 'asc',
                        width: 150
                    },
                    {
                        label: 'Points',
                        field: 'points',
                        sort: 'asc',
                        width: 150
                    }
                ],
                rows: 
                    this.state.leaderboard              
            }
        })
    }

    render() {
        if (this.state.loading) {
            return <div>Loading Leaderboard...</div>
        }

        return (
            <div>
                <br />
                <h1 style={{ textAlign: "center" }}>Leaderboard</h1>
                <br />
                <MDBDataTable
                    striped
                    bordered
                    small
                    data={this.state.data}
                />
            </div>
        );
    }
}

export default Leaderboard;