import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Award, TrendingUp, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import blink from '@/blink/client'

interface UserStats {
  totalRestaurants: number
  totalVotesReceived: number
  totalVotesGiven: number
  popularityScore: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats>({
    totalRestaurants: 0,
    totalVotesReceived: 0,
    totalVotesGiven: 0,
    popularityScore: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userData = await blink.auth.me()
      setUser(userData)

      // Load user statistics
      const [restaurants, allVotes, userVotes] = await Promise.all([
        blink.db.restaurants.list({ where: { userId: userData.id } }),
        blink.db.restaurantVotes.list(),
        blink.db.restaurantVotes.list({ where: { userId: userData.id } })
      ])

      // Calculate votes received on user's restaurants
      const userRestaurantIds = restaurants.map(r => r.id)
      const votesReceived = allVotes.filter(vote => 
        userRestaurantIds.includes(vote.restaurant_id)
      )

      // Calculate popularity score (up votes - down votes on user's restaurants)
      const upVotes = votesReceived.filter(v => v.vote_type === 'up').length
      const downVotes = votesReceived.filter(v => v.vote_type === 'down').length

      setStats({
        totalRestaurants: restaurants.length,
        totalVotesReceived: votesReceived.length,
        totalVotesGiven: userVotes.length,
        popularityScore: upVotes - downVotes
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  const getBadgeLevel = (score: number) => {
    if (score >= 20) return { label: 'Expert Culinaire', color: 'bg-yellow-500' }
    if (score >= 10) return { label: 'Gourmet', color: 'bg-purple-500' }
    if (score >= 5) return { label: 'Foodie', color: 'bg-blue-500' }
    if (score >= 1) return { label: 'Découvreur', color: 'bg-green-500' }
    return { label: 'Débutant', color: 'bg-gray-500' }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) return null

  const badge = getBadgeLevel(stats.popularityScore)

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getInitials(user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user.displayName || user.email.split('@')[0]}</h1>
                <div className="flex items-center text-muted-foreground mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-accent" />
                <Badge className={`${badge.color} text-white`}>
                  {badge.label}
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={() => blink.auth.logout()}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {stats.totalRestaurants}
              </div>
              <div className="text-sm text-muted-foreground">
                Restaurant{stats.totalRestaurants !== 1 ? 's' : ''} ajouté{stats.totalRestaurants !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.totalVotesReceived}
              </div>
              <div className="text-sm text-muted-foreground">
                Vote{stats.totalVotesReceived !== 1 ? 's' : ''} reçu{stats.totalVotesReceived !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.totalVotesGiven}
              </div>
              <div className="text-sm text-muted-foreground">
                Vote{stats.totalVotesGiven !== 1 ? 's' : ''} donné{stats.totalVotesGiven !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold mb-1 ${
                stats.popularityScore > 0 ? 'text-green-600' : 
                stats.popularityScore < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.popularityScore > 0 ? '+' : ''}{stats.popularityScore}
              </div>
              <div className="text-sm text-muted-foreground">
                Score de popularité
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Vos accomplissements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  🍽️
                </div>
                <div>
                  <div className="font-medium">Premier restaurant ajouté</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.totalRestaurants > 0 ? 'Accompli ✓' : 'Ajoutez votre premier restaurant'}
                  </div>
                </div>
              </div>
              {stats.totalRestaurants > 0 && (
                <Badge variant="secondary">Accompli</Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  👍
                </div>
                <div>
                  <div className="font-medium">Premier vote positif</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.popularityScore > 0 ? 'Accompli ✓' : 'Recevez votre premier vote positif'}
                  </div>
                </div>
              </div>
              {stats.popularityScore > 0 && (
                <Badge variant="secondary">Accompli</Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  🏆
                </div>
                <div>
                  <div className="font-medium">Contributeur actif</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.totalVotesGiven >= 5 ? 'Accompli ✓' : `Votez pour ${5 - stats.totalVotesGiven} restaurants de plus`}
                  </div>
                </div>
              </div>
              {stats.totalVotesGiven >= 5 && (
                <Badge variant="secondary">Accompli</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Conseils pour améliorer votre score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-sm">
                Ajoutez des photos attrayantes à vos recommandations pour recevoir plus de votes positifs
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-sm">
                Rédigez des descriptions détaillées avec vos plats préférés et l'ambiance du lieu
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-sm">
                Participez activement en votant pour les restaurants de vos collègues
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}