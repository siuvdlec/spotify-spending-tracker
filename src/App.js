import React, { useEffect, useState } from "react";
import "./app.css";
import DateDiff from "date-diff";

function pipe() {
  let ret = arguments[0];
  for (let i = 1; i < arguments.length; i++) {
    ret = arguments[i](ret);
  }
  return ret;
}

function calculateActiveSeconds(activeFrom) {
  return parseInt(new DateDiff(new Date(), new Date(activeFrom)).seconds(), 10);
}

function sum(a) {
  return a.reduce((a, b) => a + b, 0);
}

function calculateDebit({ from, to, amount, components }) {
  return (amount / components) * new DateDiff(to, from).months();
}

function calculateTotalDebit(activeFrom, spotifyCosts) {
  return pipe(
    spotifyCosts
      .map((sc) => ({
        from: new Date(sc.from ?? activeFrom),
        to: sc.to ? new Date(sc.to) : new Date(),
        amount: sc.amount,
        components: sc.components,
      }))
      .map(calculateDebit),
    sum
  );
}

function progress(totalPaid, activeFrom, spotifyCosts) {
  return {
    activeSeconds: calculateActiveSeconds(activeFrom),
    credit: totalPaid - calculateTotalDebit(activeFrom, spotifyCosts),
  };
}

function Situation({ paid, activeFrom, spotifyCosts }) {
  const totalPaid = pipe(paid, sum);
  const [{ activeSeconds, credit }, setProgress] = useState(() =>
    progress(totalPaid, activeFrom, spotifyCosts)
  );

  useEffect(() => {
    const id = setInterval(() => {
      pipe(progress(totalPaid, activeFrom, spotifyCosts), setProgress);
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [activeFrom, spotifyCosts, totalPaid]);

  return (
    <>
      <div className="seconds d">Seconds</div>
      <div className="seconds-v v">{activeSeconds}</div>
      <div className="paid d">Paid</div>
      <div className="paid-v v">
        <Money value={totalPaid} />
      </div>
      <div className="credit d">Credit/Debit</div>
      <div className="credit-v v">
        <Money value={credit} />
      </div>
    </>
  );
}

function Money({ value }) {
  return <span>€ {value.toFixed(2).replace(".", ",")}</span>;
}

function Gravatar({ emailHash }) {
  return (
    <img
      src={`https://www.gravatar.com/avatar/${emailHash}?s=30&d=identicon`}
    />
  );
}

export function App({ familyMembers, spotifyCosts }) {
  return (
    <div className="app">
      {familyMembers.map((m) => (
        <div key={m.emailHash} className="card">
          <div className="avatar">
            <div>
              <Gravatar emailHash={m.emailHash} />
            </div>
            <div>{m.name}</div>
          </div>
          <Situation
            paid={m.paid}
            activeFrom={m.activeFrom}
            spotifyCosts={spotifyCosts}
          />
        </div>
      ))}
    </div>
  );
}
