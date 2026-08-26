export default function Loading({ message }) {
  return (
    <div className="loading-wrap">
      <div className="spinner" />
      <div className="loading-msg">{message}</div>
    </div>
  );
}