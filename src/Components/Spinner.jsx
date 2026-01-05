const Spinner = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "200px",
      }}
    >
      <svg
        width="60"
        height="60"
        viewBox="0 0 50 50"
        style={{ animation: "spin 1s linear infinite" }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Spinner;
