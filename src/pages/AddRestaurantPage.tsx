import { useState } from 'react'
import { ArrowLeft, Upload, MapPin, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import blink from '@/blink/client'
import { useToast } from '@/hooks/use-toast'

interface AddRestaurantPageProps {
  onBack: () => void
}

export default function AddRestaurantPage({ onBack }: AddRestaurantPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    cuisineType: '',
    priceRange: '',
    address: '',
    description: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const cuisineTypes = [
    'Française',
    'Italienne',
    'Japonaise',
    'Chinoise',
    'Indienne',
    'Mexicaine',
    'Thaïlandaise',
    'Méditerranéenne',
    'Américaine',
    'Libanaise',
    'Vietnamienne',
    'Grecque',
    'Espagnole',
    'Marocaine',
    'Coréenne',
    'Autre'
  ]

  const priceRanges = [
    { value: '€', label: '€ - Économique (moins de 15€)' },
    { value: '€€', label: '€€ - Modéré (15-30€)' },
    { value: '€€€', label: '€€€ - Cher (30-50€)' },
    { value: '€€€€', label: '€€€€ - Très cher (plus de 50€)' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.cuisineType || !formData.priceRange || !formData.address) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const user = await blink.auth.me()
      let imageUrl = ''

      // Upload image if provided
      if (imageFile) {
        const { publicUrl } = await blink.storage.upload(
          imageFile,
          `restaurants/${Date.now()}_${imageFile.name}`,
          { upsert: true }
        )
        imageUrl = publicUrl
      }

      // Create restaurant
      await blink.db.restaurants.create({
        id: `restaurant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        cuisineType: formData.cuisineType,
        priceRange: formData.priceRange,
        address: formData.address,
        description: formData.description,
        imageUrl,
        userId: user.id
      })

      toast({
        title: 'Restaurant ajouté !',
        description: 'Votre recommandation a été ajoutée avec succès'
      })

      // Reset form
      setFormData({
        name: '',
        cuisineType: '',
        priceRange: '',
        address: '',
        description: '',
      })
      setImageFile(null)
      setImagePreview('')
      
      // Go back to home
      onBack()
    } catch (error) {
      console.error('Error adding restaurant:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le restaurant',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 -ml-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Ajouter un restaurant</h1>
        <p className="text-muted-foreground">
          Partagez votre découverte avec vos collègues
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🍽️</span>
            <span>Informations du restaurant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Photo du restaurant (optionnel)</Label>
              <div className="flex flex-col space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview('')
                      }}
                      className="absolute top-2 right-2"
                    >
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Ajoutez une photo pour rendre votre recommandation plus attrayante
                    </p>
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Choisir une photo
                        </span>
                      </Button>
                    </Label>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Restaurant Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du restaurant *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Le Petit Bistrot"
                required
              />
            </div>

            {/* Cuisine Type */}
            <div className="space-y-2">
              <Label>Type de cuisine *</Label>
              <Select value={formData.cuisineType} onValueChange={(value) => handleInputChange('cuisineType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type de cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map(cuisine => (
                    <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Gamme de prix *</Label>
              <Select value={formData.priceRange} onValueChange={(value) => handleInputChange('priceRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la gamme de prix" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map(price => (
                    <SelectItem key={price.value} value={price.value}>
                      {price.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Partagez votre expérience, les plats recommandés, l'ambiance..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Ajout en cours...' : 'Ajouter le restaurant'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}