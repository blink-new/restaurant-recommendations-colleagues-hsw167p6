import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import blink from '@/blink/client'
import Header from '@/components/layout/Header'
import HomePage from '@/pages/HomePage'
import AddRestaurantPage from '@/pages/AddRestaurantPage'
import MyRecommendationsPage from '@/pages/MyRecommendationsPage'
import ProfilePage from '@/pages/ProfilePage'

type Page = 'home' | 'add' | 'my-recommendations' | 'profile'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">🍽️</h1>
            <h2 className="text-2xl font-bold mb-4">Resto Entre Collègues</h2>
            <p className="text-muted-foreground mb-6">
              Découvrez, partagez et votez pour les meilleurs restaurants avec vos collègues
            </p>
          </div>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'add':
        return <AddRestaurantPage onBack={() => setCurrentPage('home')} />
      case 'my-recommendations':
        return <MyRecommendationsPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        user={user}
      />
      <main className="pb-20">
        {renderPage()}
      </main>
      <Toaster />
    </div>
  )
}

export default App