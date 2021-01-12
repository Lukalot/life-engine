#PARTICLE TYPES DATA STRUCTURE

Particle interaction definitions use hjson format.  The following template describes their attributes.

```hjson
{
    'particle name': {
        color: [ r, g, b, a ]
        relationships: {
            default: {
                // default rule for undeclared relationships
            },
            'other particles name': {
                'distance float value as string': number;
                '10.5': -2
            }
        },
        solid: bool,                    // will this particle allow other particles to move through its collision radius?
        effect_inner_radius: number,    // area / hole within which the relationships do not apply yet. Relationship distances start added to this value
        collision_radius: number,       // the physical area of the particle
        visible_radius: number‭‭,         // visual size of the representative circle. Defaults to collision radius.
    },
    // more types ...
}
```
