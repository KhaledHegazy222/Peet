import axios from "axios";
import { redirect } from "next/navigation";

const IP = "localhost";
// const IP = "192.168.1.9";

export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        display: "grid",
        placeContent: "center",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "50px",
          fontWeight: "600",
        }}
      >
        Peet
      </h2>
      <p
        style={{
          textAlign: "center",
          margin: "20px 0",
        }}
      >
        Online Meeting Webapp
      </p>
      <form
        action={async () => {
          "use server";
          
          const response = await axios.get(`http://${IP}:3002/new`);
          console.log("DOne");
          redirect(`/room/${response.data}`);
        }}
      >
        <button
          type="submit"
          style={{
            padding: "15px 30px",
            borderRadius: "4px",
            backgroundColor: "#22f",
            color: "white",
            fontWeight: "600",
          }}
        >
          Create New Meeting
        </button>
      </form>
    </main>
  );
}
