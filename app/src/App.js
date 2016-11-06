import React from 'react';
import { Image, Table, Glyphicon, Row, Col, Panel } from 'react-bootstrap';
import Api from './Api';
import './App.css';
const DateDiff = require('date-diff');

var calculateActiveSeconds = function (dateString) {
    var diff = new DateDiff(new Date(), new Date(dateString));

    return parseInt(diff.seconds(), 10);
};

var calculateCredit = function (totalPaid, dateString, spotifyInfo) {
    var diff = new DateDiff(new Date(), new Date(dateString));

    return totalPaid - spotifyInfo.cost / spotifyInfo.nComponents * diff.months();
};

var decorateMembers = function (peopleRaw, spotifyInfo) {
    const members = [];
    for (let i = 0; i < peopleRaw.length; i++) {
        const totalPaid = typeof peopleRaw[i].paid === 'object' ? peopleRaw[i].paid.reduce((a, b) => a + b, 0) : 0;
        members.push({
            name: peopleRaw[i].name,
            statusIcon: peopleRaw[i].active ? 'ok' : 'remove',
            emailHash: peopleRaw[i].emailHash,
            totalPaid: totalPaid,
            activeDays: calculateActiveSeconds(peopleRaw[i].activeFrom),
            credit: calculateCredit(totalPaid, peopleRaw[i].activeFrom, spotifyInfo)
        });
    }

    return members;
};

function MoneyFormatter(props) {
    return <span><Glyphicon glyph="eur" /> {props.value.toFixed(2).replace('.', ',')}</span>;
}

function Gravatar(props) {
    const avatarLink = 'https://www.gravatar.com/avatar/'+props.emailHash+'?s=30&d=identicon';

    return <Image src={avatarLink} circle />
}

function TrItem(props) {
    return <tr>
        <td><Gravatar emailHash={props.data.emailHash} circle /></td>
        <td><Glyphicon glyph={props.data.statusIcon} /></td>
        <td>{props.data.name}</td>
        <td>{props.data.activeDays}</td>
        <td><MoneyFormatter value={props.data.totalPaid} /></td>
        <td><MoneyFormatter value={props.data.credit} /></td>
    </tr>;
}

function TBody(props) {
    const trItems = props.data.map((person, index) =>
        <TrItem key={index} data={person} />
    );

    return (
        <tbody>
            {trItems}
        </tbody>
    );
}

var App = React.createClass({

    getInitialState: function() {
        return {
            familyOwnerData: {emailAvatar: '', name: ''},
            familyMembersData: [],
            spotifyInfo: {cost: 0, nComponents: 0},
        }
    },

    componentDidMount: function () {
        var _this = this;
        Api.getData().then(function (result) {
            _this.setState({
                familyOwnerData: result.familyOwner,
                familyMembersData: result.familyMembers,
                spotifyInfo: result.spotifyInfo,
            });
        })
    },

    render: function() {
        return (
            <Row className="show-grid">
                <Col xs={12}>
                    <Panel className="text-center panel-info">
                        Family owner <br/>
                        <Gravatar emailHash={this.state.familyOwnerData.emailHash} circle /> {this.state.familyOwnerData.name}
                    </Panel>
                </Col>
                <Col xs={12}>
                    <Table striped hover responsive>
                        <thead>
                        <tr>
                            <th> </th>
                            <th>Status</th>
                            <th>Name</th>
                            <th>Seconds in family</th>
                            <th>Total Paid</th>
                            <th>Credit/Debit</th>
                        </tr>
                        </thead>
                        <TBody data={decorateMembers(this.state.familyMembersData, this.state.spotifyInfo)}/>
                    </Table>
                </Col>
            </Row>
        );
    }
});

export default App;
