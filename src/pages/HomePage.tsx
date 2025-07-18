import { useState, useEffect, useCallback } from 'react'
import { Search, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

interface Vote {
  restaurant_id: string
  vote_type: 'up' | 'down'
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [cuisineFilter, setCuisineFilter] = useState<string>('')
  const [priceFilter, setPriceFilter] = useState<string>('')
  const { toast } = useToast()

  const loadRestaurants = useCallback(async () => {
    try {
      const data = await blink.db.restaurants.list({
        orderBy: { createdAt: 'desc' }
      })
      setRestaurants(data)
    } catch (error) {
      console.error('Error loading restaurants:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les restaurants',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadVotes = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      const data = await blink.db.restaurantVotes.list({
        where: { userId: user.id }
      })
      setVotes(data)
    } catch (error) {
      console.error('Error loading votes:', error)
    }
  }, [])

  useEffect(() => {
    loadRestaurants()
    loadVotes()
  }, [loadRestaurants, loadVotes])

  const handleVote = async (restaurantId: string, voteType: 'up' | 'down') => {
    try {
      const user = await blink.auth.me()
      const existingVote = votes.find(v => v.restaurant_id === restaurantId)

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking the same vote type
          await blink.db.restaurantVotes.delete(existingVote.id)
          setVotes(votes.filter(v => v.restaurant_id !== restaurantId))
        } else {
          // Update vote type
          await blink.db.restaurantVotes.update(existingVote.id, { voteType })
          setVotes(votes.map(v => 
            v.restaurant_id === restaurantId 
              ? { ...v, vote_type: voteType }
              : v
          ))
        }
      } else {
        // Create new vote
        await blink.db.restaurantVotes.create({
          id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          restaurantId,
          userId: user.id,
          voteType
        })
        setVotes([...votes, { restaurant_id: restaurantId, vote_type: voteType }])
      }

      toast({
        title: 'Vote enregistré',
        description: `Votre ${voteType === 'up' ? 'vote positif' : 'vote négatif'} a été pris en compte`
      })
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer votre vote',
        variant: 'destructive'
      })
    }
  }

  const getVoteForRestaurant = (restaurantId: string) => {
    return votes.find(v => v.restaurant_id === restaurantId)
  }

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCuisine = !cuisineFilter || restaurant.cuisine_type === cuisineFilter
    const matchesPrice = !priceFilter || restaurant.price_range === priceFilter
    
    return matchesSearch && matchesCuisine && matchesPrice
  })

  const cuisineTypes = [...new Set(restaurants.map(r => r.cuisine_type))]
  const priceRanges = ['€', '€€', '€€€', '€€€€']

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un restaurant, cuisine, ou adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les cuisines</SelectItem>
              {cuisineTypes.map(cuisine => (
                <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Prix" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les prix</SelectItem>
              {priceRanges.map(price => (
                <SelectItem key={price} value={price}>{price}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(cuisineFilter || priceFilter) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setCuisineFilter('')
                setPriceFilter('')
              }}
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>

      {/* Restaurant Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold mb-2">Aucun restaurant trouvé</h3>
          <p className="text-muted-foreground mb-4">
            {restaurants.length === 0 
              ? "Soyez le premier à recommander un restaurant !" 
              : "Essayez de modifier vos critères de recherche"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => {
            const userVote = getVoteForRestaurant(restaurant.id)
            
            return (
              <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
                {restaurant.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={restaurant.image_url} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={userVote?.vote_type === 'up' ? 'default' : 'outline'}
                        onClick={() => handleVote(restaurant.id, 'up')}
                        className="flex items-center space-x-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={userVote?.vote_type === 'down' ? 'destructive' : 'outline'}
                        onClick={() => handleVote(restaurant.id, 'down')}
                        className="flex items-center space-x-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(restaurant.user_id)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {new Date(restaurant.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
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