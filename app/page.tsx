import { HabitList } from '@/components/habit-list'
import { MotivationalQuotes } from '@/components/motivational-quotes'

export default function Home() {
  return (
    <>
      <MotivationalQuotes />
      <main className="container mx-auto max-w-6xl p-4">
        <HabitList />
      </main>
    </>
  )
}