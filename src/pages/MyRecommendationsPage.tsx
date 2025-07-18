import { useState, useEffect, useCallback } from 'react'
import { Edit, Trash2, MapPin, ThumbsUp, ThumbsDown, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import blink from '@/blink/client'
import { useToast } from '@/hooks/use-toast'

interface Restaurant {
  id: string
  name: string
  cuisine_type: string
  price_range: string
  address: string
  description: string
  image_url: string
  user_id: string
  created_at: string
}

interface VoteCount {
  restaurant_id: string
  up_votes: number
  down_votes: number
}

export default function MyRecommendationsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadMyRestaurants = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      const data = await blink.db.restaurants.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setRestaurants(data)
    } catch (error) {
      console.error('Error loading my restaurants:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos recommandations',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadVoteCounts = useCallback(async () => {
    try {
      // Get all votes for all restaurants
      const allVotes = await blink.db.restaurantVotes.list()
      
      // Count votes by restaurant
      const counts: { [key: string]: VoteCount } = {}
      
      allVotes.forEach(vote => {
        if (!counts[vote.restaurant_id]) {
          counts[vote.restaurant_id] = {
            restaurant_id: vote.restaurant_id,
            up_votes: 0,
            down_votes: 0
          }
        }
        
        if (vote.vote_type === 'up') {
          counts[vote.restaurant_id].up_votes++
        } else {
          counts[vote.restaurant_id].down_votes++
        }
      })
      
      setVoteCounts(Object.values(counts))
    } catch (error) {
      console.error('Error loading vote counts:', error)
    }
  }, [])

  useEffect(() => {
    loadMyRestaurants()
    loadVoteCounts()
  }, [loadMyRestaurants, loadVoteCounts])

  const handleDelete = async (restaurantId: string) => {
    try {
      await blink.db.restaurants.delete(restaurantId)
      setRestaurants(restaurants.filter(r => r.id !== restaurantId))
      toast({
        title: 'Restaurant supprimé',
        description: 'Votre recommandation a été supprimée'
      })
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le restaurant',
        variant: 'destructive'
      })
    }
  }

  const getVoteCount = (restaurantId: string) => {
    return voteCounts.find(vc => vc.restaurant_id === restaurantId) || {
      restaurant_id: restaurantId,
      up_votes: 0,
      down_votes: 0
    }
  }

  const getPopularityScore = (restaurantId: string) => {
    const votes = getVoteCount(restaurantId)
    return votes.up_votes - votes.down_votes
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Mes Recommandations</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Mes Recommandations</h1>
        <p className="text-muted-foreground">
          Gérez vos restaurants recommandés ({restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''})
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold mb-2">Aucune recommandation</h3>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas encore ajouté de restaurant. Commencez par partager vos bonnes adresses !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => {
            const votes = getVoteCount(restaurant.id)
            const popularityScore = getPopularityScore(restaurant.id)
            
            return (
              <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {restaurant.image_url && (
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={restaurant.image_url} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
                      {popularityScore > 0 ? `+${popularityScore}` : popularityScore}
                    </div>
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{restaurant.name}</h3>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {restaurant.price_range}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium">
                      {restaurant.cuisine_type}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1 shrink-0" />
                    <span className="line-clamp-1">{restaurant.address}</span>
                  </div>
                  
                  {restaurant.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}
                  
                  {/* Vote Statistics */}
                  <div className="flex items-center justify-between mb-4 p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-green-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{votes.up_votes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-red-600">
                        <ThumbsDown className="h-4 w-4" />
                        <span>{votes.down_votes}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(restaurant.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer ce restaurant ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Le restaurant "{restaurant.name}" sera définitivement supprimé de vos recommandations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(restaurant.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}