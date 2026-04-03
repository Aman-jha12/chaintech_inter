import Appbar from "./components/Appbar";
import TaskManager from "./components/TaskManager";


export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950">
      <Appbar />
      <TaskManager />
    </main>
  )
}
