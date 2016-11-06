import React, { Component } from 'react';
import { Image, Table, Glyphicon, Row, Col, Panel } from 'react-bootstrap';
import './App.css';
const DateDiff = require('date-diff');
const data = require('./data.json');

var calculateActiveSeconds = function (dateString) {
    var diff = new DateDiff(new Date(), new Date(dateString));

    return parseInt(diff.seconds(), 10);
};

var calculateCredit = function (totalPaid, dateString) {
    var diff = new DateDiff(new Date(), new Date(dateString));

    return totalPaid - data.spotifyFamily.cost / data.spotifyFamily.nComponents * diff.months();
};

var decorateMembers = function (peopleRaw) {
    const people = [];
    for (let i = 0; i < peopleRaw.length; i++) {
        const totalPaid = typeof peopleRaw[i].paid === 'object' ? peopleRaw[i].paid.reduce((a, b) => a + b, 0) : 0;
        people.push({
            name: peopleRaw[i].name,
            statusIcon: peopleRaw[i].active ? 'ok' : 'remove',
            emailAvatar: peopleRaw[i].emailAvatar,
            totalPaid: totalPaid,
            activeDays: calculateActiveSeconds(peopleRaw[i].activeFrom),
            credit: calculateCredit(totalPaid, peopleRaw[i].activeFrom)
        });
    }

    return people;
};

function MoneyFormatter(props) {
    return <span><Glyphicon glyph="eur" /> {props.value.toFixed(2).replace('.', ',')}</span>;
}

function Gravatar(props) {
    const avatarLink = 'https://www.gravatar.com/avatar/'+require("blueimp-md5")(props.email)+'?s=30&d=identicon';

    return <Image src={avatarLink} circle />
}

function TrItem(props) {
    return <tr>
        <td><Gravatar email={props.data.emailAvatar} circle /></td>
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

class App extends Component {
    render() {
        return (
            <Row className="show-grid">
                <Col xs={12}>
                    <Panel className="text-center panel-info">
                        Family owner <br/>
                        <Gravatar email={data.familyOwner.emailAvatar} circle /> {data.familyOwner.name}
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
                        <TBody data={decorateMembers(data.familyMembers)}/>
                    </Table>
                </Col>
            </Row>
        );
    }
}

export default App;
