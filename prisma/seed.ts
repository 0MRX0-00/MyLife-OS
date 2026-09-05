import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const exercises = [
  // ─── CHEST (18) ────────────────────────────────────────────────────────────
  { name: "Barbell Bench Press", muscleGroup: "chest", category: "compound", difficulty: "intermediate", instructions: "Lie flat on bench, grip bar slightly wider than shoulder width, lower bar to mid-chest, press up explosively." },
  { name: "Incline Barbell Bench Press", muscleGroup: "chest", category: "compound", difficulty: "intermediate", instructions: "Set bench to 30-45 degrees, lower bar to upper chest, press up." },
  { name: "Decline Barbell Bench Press", muscleGroup: "chest", category: "compound", difficulty: "intermediate", instructions: "Set decline bench, lower bar to lower chest, press up." },
  { name: "Flat Dumbbell Press", muscleGroup: "chest", category: "compound", difficulty: "beginner", instructions: "Lie flat, press dumbbells directly above chest, lowering until elbows reach 90 degrees." },
  { name: "Incline Dumbbell Press", muscleGroup: "chest", category: "compound", difficulty: "intermediate", instructions: "Incline bench at 30 degrees, press dumbbells overhead." },
  { name: "Decline Dumbbell Press", muscleGroup: "chest", category: "compound", difficulty: "intermediate", instructions: "Decline bench, press dumbbells targeting lower chest fibers." },
  { name: "Dumbbell Flyes", muscleGroup: "chest", category: "isolation", difficulty: "beginner", instructions: "Lie flat, arc dumbbells out to sides with slight elbow bend, squeeze chest at top." },
  { name: "Incline Dumbbell Flyes", muscleGroup: "chest", category: "isolation", difficulty: "intermediate", instructions: "Incline bench, fly dumbbells outward targeting upper chest." },
  { name: "Cable Crossover", muscleGroup: "chest", category: "isolation", difficulty: "intermediate", instructions: "Stand between cable towers, bring handles together at mid-chest level." },
  { name: "Low-to-High Cable Fly", muscleGroup: "chest", category: "isolation", difficulty: "intermediate", instructions: "Set cables at lowest pulley, sweep handles upward and together for upper chest." },
  { name: "High-to-Low Cable Fly", muscleGroup: "chest", category: "isolation", difficulty: "intermediate", instructions: "Set cables at highest pulley, press down and across body for lower chest." },
  { name: "Pec Deck Fly Machine", muscleGroup: "chest", category: "machine", difficulty: "beginner", instructions: "Sit on machine, squeeze handles/pads together in front of chest." },
  { name: "Push-ups", muscleGroup: "chest", category: "bodyweight", difficulty: "beginner", instructions: "Hands shoulder-width, lower chest to floor, push up keeping core rigid." },
  { name: "Incline Push-ups", muscleGroup: "chest", category: "bodyweight", difficulty: "beginner", instructions: "Hands on elevated surface like bench, perform push-up." },
  { name: "Decline Push-ups", muscleGroup: "chest", category: "bodyweight", difficulty: "intermediate", instructions: "Feet elevated on bench, lower chest toward floor." },
  { name: "Chest Dips", muscleGroup: "chest", category: "bodyweight", difficulty: "intermediate", instructions: "Lean torso forward on parallel bars, lower until upper arms parallel to floor, press up." },
  { name: "Svend Press", muscleGroup: "chest", category: "isolation", difficulty: "beginner", instructions: "Pinch weight plate between palms at chest level, press straight out and back." },
  { name: "Floor Press", muscleGroup: "chest", category: "compound", difficulty: "intermediate", instructions: "Lie on floor, press barbell or dumbbells until upper arm contacts floor." },

  // ─── BACK (21) ─────────────────────────────────────────────────────────────
  { name: "Barbell Conventional Deadlift", muscleGroup: "back", category: "compound", difficulty: "advanced", instructions: "Stand with feet shoulder-width, hinge hips, grip barbell, drive heels and extend hips." },
  { name: "Sumo Deadlift", muscleGroup: "back", category: "compound", difficulty: "advanced", instructions: "Wide stance, hands inside knees, pull bar keeping chest up." },
  { name: "Rack Pull", muscleGroup: "back", category: "compound", difficulty: "intermediate", instructions: "Deadlift starting with bar set on safety pins at knee height." },
  { name: "Pull-ups", muscleGroup: "back", category: "bodyweight", difficulty: "intermediate", instructions: "Overhand wide grip, pull chest up to bar." },
  { name: "Chin-ups", muscleGroup: "back", category: "bodyweight", difficulty: "beginner", instructions: "Underhand grip, pull chin over bar targeting lats and biceps." },
  { name: "Neutral Grip Pull-ups", muscleGroup: "back", category: "bodyweight", difficulty: "intermediate", instructions: "Palms facing each other, pull torso to bar." },
  { name: "Barbell Bent-Over Row", muscleGroup: "back", category: "compound", difficulty: "intermediate", instructions: "Hinge torso to 45 degrees, row bar to lower abdomen." },
  { name: "Pendlay Row", muscleGroup: "back", category: "compound", difficulty: "advanced", instructions: "Torso parallel to floor, row barbell dynamically off the floor each rep." },
  { name: "Lat Pulldown (Wide Grip)", muscleGroup: "back", category: "machine", difficulty: "beginner", instructions: "Pull wide bar down to upper chest, squeezing lats." },
  { name: "Lat Pulldown (Close Neutral Grip)", muscleGroup: "back", category: "machine", difficulty: "beginner", instructions: "Use V-bar attachment, pull to upper chest." },
  { name: "Seated Cable Row", muscleGroup: "back", category: "machine", difficulty: "beginner", instructions: "Sit upright, pull handle toward navel, driving elbows backward." },
  { name: "One-Arm Dumbbell Row", muscleGroup: "back", category: "compound", difficulty: "beginner", instructions: "One knee on bench, pull dumbbell to hip." },
  { name: "T-Bar Row", muscleGroup: "back", category: "compound", difficulty: "intermediate", instructions: "Straddle landmine bar, pull chest to handles." },
  { name: "Meadows Row", muscleGroup: "back", category: "compound", difficulty: "intermediate", instructions: "Side-stance landmine row using overhand grip for lat width." },
  { name: "Straight-Arm Cable Pulldown", muscleGroup: "back", category: "isolation", difficulty: "beginner", instructions: "Keep arms extended, sweep bar down to thighs using lats." },
  { name: "Face Pulls", muscleGroup: "back", category: "isolation", difficulty: "beginner", instructions: "Attach rope to cable, pull to nose level, rotating shoulders externally." },
  { name: "Hyperextensions / Back Extensions", muscleGroup: "back", category: "bodyweight", difficulty: "beginner", instructions: "Lock feet on 45-degree bench, extend hips to align spine." },
  { name: "Barbell Shrugs", muscleGroup: "back", category: "isolation", difficulty: "beginner", instructions: "Elevate shoulders straight up toward ears holding barbell." },
  { name: "Dumbbell Shrugs", muscleGroup: "back", category: "isolation", difficulty: "beginner", instructions: "Hold dumbbells at sides, shrug shoulders upward." },

  // ─── SHOULDERS (14) ────────────────────────────────────────────────────────
  { name: "Overhead Barbell Press (Military Press)", muscleGroup: "shoulders", category: "compound", difficulty: "intermediate", instructions: "Press barbell overhead from front delts while bracing core." },
  { name: "Seated Dumbbell Shoulder Press", muscleGroup: "shoulders", category: "compound", difficulty: "beginner", instructions: "Sit upright, press dumbbells overhead from ear level." },
  { name: "Arnold Press", muscleGroup: "shoulders", category: "compound", difficulty: "intermediate", instructions: "Start palms facing you, rotate 180 degrees while pressing overhead." },
  { name: "Dumbbell Lateral Raise", muscleGroup: "shoulders", category: "isolation", difficulty: "beginner", instructions: "Raise dumbbells out to sides until arms parallel with floor." },
  { name: "Cable Lateral Raise", muscleGroup: "shoulders", category: "isolation", difficulty: "beginner", instructions: "Low pulley cable raise behind or in front of body for side delts." },
  { name: "Machine Lateral Raise", muscleGroup: "shoulders", category: "machine", difficulty: "beginner", instructions: "Sit on lateral machine, press arms outward." },
  { name: "Barbell Front Raise", muscleGroup: "shoulders", category: "isolation", difficulty: "beginner", instructions: "Lift barbell with straight arms to shoulder height." },
  { name: "Dumbbell Front Raise", muscleGroup: "shoulders", category: "isolation", difficulty: "beginner", instructions: "Alternating or double dumbbell front raise." },
  { name: "Rear Delt Dumbbell Fly", muscleGroup: "shoulders", category: "isolation", difficulty: "beginner", instructions: "Bend forward 90 degrees, raise dumbbells to sides." },
  { name: "Rear Delt Cable Fly", muscleGroup: "shoulders", category: "isolation", difficulty: "intermediate", instructions: "Cross cables at eye height, pull outward for rear delts." },
  { name: "Reverse Pec Deck Machine", muscleGroup: "shoulders", category: "machine", difficulty: "beginner", instructions: "Face machine, fly handles backward for rear delts." },
  { name: "Upright Row", muscleGroup: "shoulders", category: "compound", difficulty: "intermediate", instructions: "Pull bar up close to body to chest height." },
  { name: "Push Press", muscleGroup: "shoulders", category: "compound", difficulty: "advanced", instructions: "Dip knees slightly and drive barbell overhead dynamically." },

  // ─── BICEPS (12) ───────────────────────────────────────────────────────────
  { name: "Barbell Curl", muscleGroup: "biceps", category: "isolation", difficulty: "beginner", instructions: "Underhand grip on bar, curl up without swinging body." },
  { name: "EZ-Bar Bicep Curl", muscleGroup: "biceps", category: "isolation", difficulty: "beginner", instructions: "Use angled EZ-bar to reduce wrist strain." },
  { name: "Dumbbell Alternating Curl", muscleGroup: "biceps", category: "isolation", difficulty: "beginner", instructions: "Curl one dumbbell at a time, supinating wrist at top." },
  { name: "Incline Dumbbell Curl", muscleGroup: "biceps", category: "isolation", difficulty: "intermediate", instructions: "Sit on 45-degree incline bench, curl dumbbells from full stretch." },
  { name: "Hammer Curl", muscleGroup: "biceps", category: "isolation", difficulty: "beginner", instructions: "Neutral grip (palms facing each other), curl upward targeting brachialis." },
  { name: "Cable Rope Curl", muscleGroup: "biceps", category: "isolation", difficulty: "beginner", instructions: "Attach rope to low pulley, curl and spread rope at top." },
  { name: "Preacher Curl", muscleGroup: "biceps", category: "isolation", difficulty: "intermediate", instructions: "Rest arms on preacher pad, curl bar/dumbbells." },
  { name: "Concentration Curl", muscleGroup: "biceps", category: "isolation", difficulty: "beginner", instructions: "Sit, rest elbow against inner thigh, curl single dumbbell." },
  { name: "Spider Curl", muscleGroup: "biceps", category: "isolation", difficulty: "intermediate", instructions: "Lie chest-down on incline bench, curl weights vertically." },
  { name: "21s Bicep Curl", muscleGroup: "biceps", category: "isolation", difficulty: "intermediate", instructions: "7 bottom half reps, 7 top half reps, 7 full range reps." },
  { name: "Reverse Grip Barbell Curl", muscleGroup: "biceps", category: "isolation", difficulty: "intermediate", instructions: "Overhand grip curl targeting forearms and brachialis." },

  // ─── TRICEPS (11) ──────────────────────────────────────────────────────────
  { name: "Tricep Rope Pushdown", muscleGroup: "triceps", category: "isolation", difficulty: "beginner", instructions: "Push rope down on high pulley, spread rope ends at bottom." },
  { name: "Straight-Bar Tricep Pushdown", muscleGroup: "triceps", category: "isolation", difficulty: "beginner", instructions: "Press straight bar down keeping elbows pinned to ribs." },
  { name: "V-Bar Tricep Pushdown", muscleGroup: "triceps", category: "isolation", difficulty: "beginner", instructions: "Use V-bar attachment on high cable cable." },
  { name: "Skull Crushers (Lying Barbell Tricep Extension)", muscleGroup: "triceps", category: "isolation", difficulty: "intermediate", instructions: "Lie on bench, lower bar toward forehead/behind head, extend elbows." },
  { name: "EZ-Bar Skull Crushers", muscleGroup: "triceps", category: "isolation", difficulty: "intermediate", instructions: "Use EZ-bar for ergonomic wrist position." },
  { name: "Overhead Dumbbell Tricep Extension", muscleGroup: "triceps", category: "isolation", difficulty: "beginner", instructions: "Hold dumbbell overhead with both hands, lower behind neck, extend." },
  { name: "Overhead Cable Tricep Extension", muscleGroup: "triceps", category: "isolation", difficulty: "intermediate", instructions: "Face away from cable, extend rope overhead." },
  { name: "Close-Grip Bench Press", muscleGroup: "triceps", category: "compound", difficulty: "intermediate", instructions: "Grip bar shoulder-width, keep elbows tucked to sides while benching." },
  { name: "Bench Dips", muscleGroup: "triceps", category: "bodyweight", difficulty: "beginner", instructions: "Hands on bench behind back, lower hips and push back up." },
  { name: "Tricep Dumbbell Kickbacks", muscleGroup: "triceps", category: "isolation", difficulty: "beginner", instructions: "Bent over, extend dumbbell backward until arm straight." },

  // ─── LEGS (Quads / Hamstrings / Glutes / Calves) (20) ──────────────────────
  { name: "Barbell Back Squat", muscleGroup: "legs", category: "compound", difficulty: "intermediate", instructions: "Bar on upper back, sit down into hips until thighs parallel, drive up." },
  { name: "Barbell Front Squat", muscleGroup: "legs", category: "compound", difficulty: "advanced", instructions: "Bar on front shoulders, keep chest tall, squat deep." },
  { name: "Goblet Squat", muscleGroup: "legs", category: "compound", difficulty: "beginner", instructions: "Hold kettlebell/dumbbell at chest, squat down between knees." },
  { name: "Leg Press Machine", muscleGroup: "legs", category: "machine", difficulty: "beginner", instructions: "Press footplate away with legs, lower with control." },
  { name: "Hack Squat Machine", muscleGroup: "legs", category: "machine", difficulty: "intermediate", instructions: "Shoulders against machine pads, squat deep." },
  { name: "Romanian Deadlift (RDL)", muscleGroup: "legs", category: "compound", difficulty: "intermediate", instructions: "Hinge hips backward with soft knees, lower bar along shins, squeeze glutes." },
  { name: "Stiff-Legged Deadlift", muscleGroup: "legs", category: "compound", difficulty: "intermediate", instructions: "Keep legs straight, lower bar toward toes to stretch hamstrings." },
  { name: "Dumbbell RDL", muscleGroup: "legs", category: "compound", difficulty: "beginner", instructions: "Perform Romanian deadlift with dumbbells." },
  { name: "Bulgarian Split Squat", muscleGroup: "legs", category: "compound", difficulty: "intermediate", instructions: "Rear foot elevated on bench, squat down on lead leg." },
  { name: "Walking Dumbbell Lunges", muscleGroup: "legs", category: "compound", difficulty: "beginner", instructions: "Step forward into lunges holding dumbbells." },
  { name: "Reverse Lunges", muscleGroup: "legs", category: "compound", difficulty: "beginner", instructions: "Step backward into lunge position." },
  { name: "Step-ups", muscleGroup: "legs", category: "compound", difficulty: "beginner", instructions: "Step onto plyo box/bench driving lead leg." },
  { name: "Leg Extension Machine", muscleGroup: "legs", category: "machine", difficulty: "beginner", instructions: "Extend knees against pad targeting quadriceps." },
  { name: "Lying Leg Curl Machine", muscleGroup: "legs", category: "machine", difficulty: "beginner", instructions: "Lie prone, curl heels toward glutes for hamstrings." },
  { name: "Seated Leg Curl Machine", muscleGroup: "legs", category: "machine", difficulty: "beginner", instructions: "Sit in machine, flex knees downward." },
  { name: "Barbell Hip Thrust", muscleGroup: "legs", category: "compound", difficulty: "intermediate", instructions: "Upper back on bench, barbell over hips, drive hips to ceiling." },
  { name: "Single-Leg Hip Thrust", muscleGroup: "legs", category: "compound", difficulty: "intermediate", instructions: "Perform hip thrust on one leg at a time." },
  { name: "Standing Calf Raise", muscleGroup: "legs", category: "isolation", difficulty: "beginner", instructions: "Rise onto balls of feet on block, lower heel below block." },
  { name: "Seated Calf Raise", muscleGroup: "legs", category: "isolation", difficulty: "beginner", instructions: "Seated machine calf raise targeting soleus." },

  // ─── CORE (12) ─────────────────────────────────────────────────────────────
  { name: "Forearm Plank", muscleGroup: "core", category: "bodyweight", difficulty: "beginner", instructions: "Hold rigid push-up position on forearms." },
  { name: "Side Plank", muscleGroup: "core", category: "bodyweight", difficulty: "beginner", instructions: "Lie on side, raise hips forming straight diagonal line." },
  { name: "Hanging Leg Raise", muscleGroup: "core", category: "bodyweight", difficulty: "intermediate", instructions: "Hang from chin bar, raise straight legs to 90 degrees." },
  { name: "Hanging Knee Raise", muscleGroup: "core", category: "bodyweight", difficulty: "beginner", instructions: "Raise knees to chest while hanging." },
  { name: "Cable Kneeling Crunch", muscleGroup: "core", category: "machine", difficulty: "beginner", instructions: "Kneel at high rope pulley, flex spine downward." },
  { name: "Ab Wheel Rollout", muscleGroup: "core", category: "bodyweight", difficulty: "advanced", instructions: "Roll wheel forward from knees/toes, pull back with abs." },
  { name: "Russian Twists", muscleGroup: "core", category: "bodyweight", difficulty: "beginner", instructions: "Sit inclined, rotate weight plate side to side." },
  { name: "Decline Sit-ups", muscleGroup: "core", category: "bodyweight", difficulty: "intermediate", instructions: "Anchor feet on decline bench, perform sit-up." },
  { name: "Bicycle Crunches", muscleGroup: "core", category: "bodyweight", difficulty: "beginner", instructions: "Alternate elbow to opposite knee in pedaling motion." },
  { name: "Captain's Chair Leg Raise", muscleGroup: "core", category: "machine", difficulty: "beginner", instructions: "Rest elbows on pads, lift legs/knees." },
  { name: "Cable Woodchoppers", muscleGroup: "core", category: "machine", difficulty: "intermediate", instructions: "Pull cable diagonally across torso for obliques." },

  // ─── CARDIO & FUNCTIONAL (12) ──────────────────────────────────────────────
  { name: "Outdoor / Treadmill Running", muscleGroup: "cardio", category: "cardio", difficulty: "beginner", instructions: "Steady state or interval running." },
  { name: "Stationary Bike / Cycling", muscleGroup: "cardio", category: "cardio", difficulty: "beginner", instructions: "Pedal at target RPM and resistance." },
  { name: "Rowing Machine Ergometer", muscleGroup: "cardio", category: "cardio", difficulty: "beginner", instructions: "Leg drive, lean back, arm pull." },
  { name: "Jump Rope", muscleGroup: "cardio", category: "cardio", difficulty: "beginner", instructions: "Single or double unders skipping." },
  { name: "Stair Climber Machine", muscleGroup: "cardio", category: "cardio", difficulty: "beginner", instructions: "Step continuously at steady pace." },
  { name: "Battle Ropes Waves & Slams", muscleGroup: "cardio", category: "cardio", difficulty: "intermediate", instructions: "Perform alternating waves or double slams." },
  { name: "Burpees", muscleGroup: "full_body", category: "bodyweight", difficulty: "intermediate", instructions: "Drop to push-up, jump feet in, jump into air." },
  { name: "Kettlebell Swings", muscleGroup: "full_body", category: "compound", difficulty: "intermediate", instructions: "Hip hinge drive kettlebell to chest height." },
  { name: "Turkish Get-up", muscleGroup: "full_body", category: "compound", difficulty: "advanced", instructions: "Lie flat with kettlebell overhead, stand up sequentially." },
  { name: "Sled / Prowler Push", muscleGroup: "full_body", category: "compound", difficulty: "intermediate", instructions: "Drive weighted sled forward with legs." },
  { name: "Wall Balls", muscleGroup: "full_body", category: "compound", difficulty: "intermediate", instructions: "Squat with medicine ball, throw up to wall target." },
  { name: "Box Jumps", muscleGroup: "full_body", category: "bodyweight", difficulty: "intermediate", instructions: "Explode onto plyo box, land softly." },
];

async function main() {
  console.log("🌱 Seeding expanded 100+ exercise database...");

  // Clear existing non-custom exercises
  await prisma.exercise.deleteMany({
    where: { isCustom: false },
  });

  // Seed exercises
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: {
        name_muscleGroup: {
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
        },
      },
      create: {
        ...exercise,
        isCustom: false,
      },
      update: {
        category: exercise.category,
        difficulty: exercise.difficulty,
        instructions: exercise.instructions,
      },
    });
  }

  console.log(`✅ Seeded ${exercises.length} comprehensive exercises across all muscle groups!`);
  console.log("🌱 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
