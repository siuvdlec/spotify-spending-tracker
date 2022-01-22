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

function calculateActiveTime(activeFrom) {
  return new DateDiff(new Date(), activeFrom).months();
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
      .filter((sc) => sc.to === null || sc.to.getTime() > activeFrom.getTime())
      .map((sc) => ({
        from: sc.from.getTime() > activeFrom.getTime() ? sc.from : activeFrom,
        to: sc.to ?? new Date(),
        amount: sc.amount,
        components: sc.components,
      }))
      .map(calculateDebit),
    sum
  );
}

function progress(totalPaid, activeFrom, spotifyCosts) {
  return {
    activeTime: calculateActiveTime(activeFrom),
    credit: totalPaid - calculateTotalDebit(activeFrom, spotifyCosts),
  };
}

function Situation({ paid, activeFrom, spotifyCosts }) {
  const totalPaid = pipe(paid, sum);
  const [{ activeTime, credit }, setProgress] = useState(() =>
    progress(totalPaid, activeFrom, spotifyCosts)
  );

  useEffect(() => {
    const id = setInterval(() => {
      pipe(progress(totalPaid, activeFrom, spotifyCosts), setProgress);
    }, 10000);
    return () => {
      clearInterval(id);
    };
  }, [activeFrom, spotifyCosts, totalPaid]);

  return (
    <>
      <div className="time d">Months</div>
      <div className="time-v v">{activeTime}</div>
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
