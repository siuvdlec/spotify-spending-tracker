import React, { useEffect, useState } from "react";
import "./app.css";
import DateDiff from "date-diff";

export function pipe() {
  let ret = arguments[0];
  for (let i = 1; i < arguments.length; i++) {
    ret = arguments[i](ret);
  }
  return ret;
}

export function calculateActiveTime(activeFrom) {
  return Math.max(0, new DateDiff(new Date(), activeFrom).months());
}

export function sum(a) {
  return a.reduce((a, b) => a + b, 0);
}

export function calculateDebit({ from, to, amount, components }) {
  return (amount / components) * new DateDiff(to, from).months();
}

export function calculateTotalDebit(activeFrom, spotifyCosts) {
  const now = new Date();
  return pipe(
    spotifyCosts
      .map((sc) => ({
        from: sc.from.getTime() > activeFrom.getTime() ? sc.from : activeFrom,
        to: sc.to !== null && sc.to.getTime() < now.getTime() ? sc.to : now,
        amount: sc.amount,
        components: sc.components,
      }))
      .filter(({ from, to }) => from.getTime() < to.getTime())
      .map(calculateDebit),
    sum
  );
}

export function progress(totalPaid, activeFrom, spotifyCosts) {
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
      src={`https://www.gravatar.com/avatar/${emailHash}?s=80&d=identicon`}
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
