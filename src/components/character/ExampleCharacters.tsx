import { placeholderCharacter } from "@/data/placeholder-character";
import { CharacterCard } from "./CharacterCard";
import { Character } from "@/types/character";
import characterDruid from "@/assets/character-druid.jpg";
import characterRogue from "@/assets/character-rogue.jpg";
import characterWarlock from "@/assets/character-warlock.jpg";

// Create a few example characters for the homepage
const exampleCharacters: Character[] = [
  {
    ...placeholderCharacter,
    id: "example-1",
    character_name: "Agatha Mosswhisper",
    character_class: "Druid",
    race: "Wood Elf",
    concept: "A spooky swamp witch who talks to frogs",
    portrait_url: characterDruid,
  },
  {
    ...placeholderCharacter,
    id: "example-2",
    character_name: "Marcus Shadowbane",
    character_class: "Rogue",
    race: "Human",
    level: 5,
    concept: "Like Jason Bourne, but with magic",
    character_data: {
      ...placeholderCharacter.character_data,
      armorClass: 16,
      hitPoints: { maximum: 38, current: 38, temporary: 0 },
    },
    portrait_url: characterRogue,
  },
  {
    ...placeholderCharacter,
    id: "example-3",
    character_name: "Cordelia Blackspun",
    character_class: "Warlock",
    race: "Tiefling",
    level: 7,
    concept: "Cruella de Vil from 101 Dalmatians",
    character_data: {
      ...placeholderCharacter.character_data,
      armorClass: 13,
      hitPoints: { maximum: 45, current: 45, temporary: 0 },
    },
    portrait_url: characterWarlock,
  },
];

export function ExampleCharacters() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-hero">Characters Created</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From grumpy dwarves to mysterious warlocks — see what other players have brought to life
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {exampleCharacters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
        
        {/* Social Proof */}
        <div className="text-center mt-12">
          <p className="text-2xl font-display font-bold text-gradient-gold">
            10,000+ Characters Created
          </p>
          <p className="text-muted-foreground mt-2">
            Join thousands of players building their perfect heroes
          </p>
        </div>
      </div>
    </section>
  );
}
