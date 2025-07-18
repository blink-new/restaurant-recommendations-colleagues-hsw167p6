import { Home, Plus, BookOpen, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import blink from '@/blink/client'

type Page = 'home' | 'add' | 'my-recommendations' | 'profile'

interface HeaderProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  user: any
}

export default function Header({ currentPage, onNavigate, user }: HeaderProps) {
  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold text-primary">Resto Entre Collègues</h1>
          </div>
          
          <nav className="flex items-center space-x-1">
            <Button
              variant={currentPage === 'home' ? 'default' : 'ghost'}
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Accueil</span>
            </Button>
            <Button
              variant={currentPage === 'my-recommendations' ? 'default' : 'ghost'}
              onClick={() => onNavigate('my-recommendations')}
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Mes Recommandations</span>
            </Button>
            <Button
              variant={currentPage === 'add' ? 'default' : 'ghost'}
              onClick={() => onNavigate('add')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </Button>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={() => onNavigate('profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => blink.auth.logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="grid grid-cols-4 h-16">
          <Button
            variant={currentPage === 'home' ? 'default' : 'ghost'}
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center justify-center h-full rounded-none"
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs">Accueil</span>
          </Button>
          <Button
            variant={currentPage === 'my-recommendations' ? 'default' : 'ghost'}
            onClick={() => onNavigate('my-recommendations')}
            className="flex flex-col items-center justify-center h-full rounded-none"
          >
            <BookOpen className="h-5 w-5 mb-1" />
            <span className="text-xs">Mes Restos</span>
          </Button>
          <Button
            variant={currentPage === 'add' ? 'default' : 'ghost'}
            onClick={() => onNavigate('add')}
            className="flex flex-col items-center justify-center h-full rounded-none"
          >
            <Plus className="h-5 w-5 mb-1" />
            <span className="text-xs">Ajouter</span>
          </Button>
          <Button
            variant={currentPage === 'profile' ? 'default' : 'ghost'}
            onClick={() => onNavigate('profile')}
            className="flex flex-col items-center justify-center h-full rounded-none"
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs">Profil</span>
          </Button>
        </div>
      </nav>
    </>
  )
}