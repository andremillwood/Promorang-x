import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForCommunities() {
  return (
    <MarketRoleLanding
      seoTitle="PROMORANG for communities — Turn shared interest into a living Scene"
      seoDescription="Give shared interests a home, help people find what matters, and turn community energy into Moments people can actually join."
      eyebrow="For communities & Scene leads"
      title="Give shared interest somewhere to live—and somewhere to go next."
      intro="A Scene is bigger than one night. Community leaders can help people discover what belongs, see what members want more of, and create reasons to keep coming back."
      primaryCta={{ label: "Propose a community response", href: "/propose" }}
      secondaryCta={{ label: "Explore Scenes", href: "/scenes" }}
      roleJob="Give the community a place to belong, a reason to move, and something worth returning to."
      discoveryUse="Discoveries help the Scene surface places, people, patterns and opportunities members should know about."
      demandUse="Demand shows what members are asking for or moving toward, helping you shape programming, partnerships and the next Moment."
      responseTitle="Turn recurring interest into something people can join"
      responseDetail="A Scene can lead into a Moment, offer, gathering or member-led action when someone is ready to make it real."
      responseStub="GATHER"
      proofTitle="Let real participation become community history"
      proofDetail="Attendance and completed actions can become part of the Scene’s memory, so the community grows around what people actually did."
      promoCardDetail="PromoCard lets each member keep their access, activity and return paths while still belonging to the larger Scene."
      truthGates={[
        "A Scene is bigger than one Moment",
        "Joining a Scene is not attendance",
        "Votes show interest, not turnout",
        "Ideas become public when they are ready",
      ]}
    />
  );
}
