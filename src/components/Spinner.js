export default function spinner({ type }) {
  if (type === "table") {
    return <tbody className="spinner-border text-light text-center"></tbody>;
  } else {
    return <div className="spinner-border text-light text-center"></div>;
  }
}
