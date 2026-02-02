"use client";

import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import { Clock, Loader2, Trophy, Users } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const GamePage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");

  const [roomData, setRoomData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  // Trivia specific state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);

  // Imposter specific state
  const [assignedWord, setAssignedWord] = useState("");
  const [isImposter, setIsImposter] = useState(false);
  const [votingStarted, setVotingStarted] = useState(false);
  const [wordsRevealed, setWordsRevealed] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    // Get current user
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      setCurrentUser(JSON.parse(userDetails));
    }

    // Listen to room updates
    if (roomId) {
      const unsubscribe = onSnapshot(doc(db, "rooms", roomId), (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setRoomData({ id: doc.id, ...data });

          // Check if game finished
          if (data.status === "finished") {
            router.push(`/client/${params.id}/result?room=${roomId}`);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [roomId, params.id, router]);

  // Initialize game based on type
  useEffect(() => {
    if (roomData && currentUser) {
      setTimeLeft(roomData.timer);

      if (roomData.gameId === 1) {
        // Trivia game - generate questions
        const triviaQuestions = generateTriviaQuestions(roomData.category);
        setQuestions(triviaQuestions);
      } else if (roomData.gameId === 2) {
        // Imposter game - check if words already assigned
        const currentPlayerData = roomData.players.find(
          (p) => p.uid === currentUser.uid,
        );

        if (currentPlayerData?.assignedWord) {
          // Word already assigned (rejoining)
          setAssignedWord(currentPlayerData.assignedWord);
          setIsImposter(currentPlayerData.assignedWord === "IMPOSTER");
        } else {
          // First time - assign words
          assignWordsToPlayers();
        }
      }
    }
  }, [roomData, currentUser]);

  const assignWordsToPlayers = async () => {
    if (!roomData || !currentUser) return;

    // Check if host should assign words
    const isHost = roomData.players.find(
      (p) => p.uid === currentUser.uid,
    )?.isHost;

    if (isHost) {
      // Host assigns words to all players
      const imposterIndex = Math.floor(Math.random() * roomData.players.length);
      const word = generateWord(roomData.category);

      const updatedPlayers = roomData.players.map((player, index) => ({
        ...player,
        assignedWord: index === imposterIndex ? "IMPOSTER" : word,
      }));

      try {
        await updateDoc(doc(db, "rooms", roomId), {
          players: updatedPlayers,
        });
      } catch (error) {
        console.error("Error assigning words:", error);
      }
    }

    // Wait for host to assign words
    // The useEffect will re-run when roomData updates
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && roomData) {
      if (roomData.gameId === 1) {
        handleGameEnd();
      } else if (roomData.gameId === 2) {
        // Show word reveal for imposter game
        setWordsRevealed(true);
      }
    }
  }, [timeLeft, roomData]);

  const generateTriviaQuestions = (category) => {
    const questionBank = {
      animals: [
        {
          question: "What is the largest land animal?",
          options: ["Elephant", "Giraffe", "Rhino", "Hippo"],
          correct: 0,
        },
        {
          question: "How many legs does a spider have?",
          options: ["6", "8", "10", "12"],
          correct: 1,
        },
        {
          question: "What is the fastest land animal?",
          options: ["Lion", "Cheetah", "Leopard", "Tiger"],
          correct: 1,
        },
        {
          question: "Which animal is known as the 'King of the Jungle'?",
          options: ["Tiger", "Lion", "Bear", "Gorilla"],
          correct: 1,
        },
        {
          question: "What do pandas primarily eat?",
          options: ["Meat", "Fish", "Bamboo", "Berries"],
          correct: 2,
        },
      ],
      football: [
        {
          question: "How many players are on a football team?",
          options: ["9", "10", "11", "12"],
          correct: 2,
        },
        {
          question: "Who won the 2018 FIFA World Cup?",
          options: ["Brazil", "Germany", "France", "Argentina"],
          correct: 2,
        },
        {
          question: "What is the maximum duration of a football match?",
          options: ["80 mins", "90 mins", "100 mins", "120 mins"],
          correct: 1,
        },
        {
          question: "Which country has won the most World Cups?",
          options: ["Germany", "Argentina", "Brazil", "Italy"],
          correct: 2,
        },
        {
          question: "What color card does a referee show for a serious foul?",
          options: ["Yellow", "Red", "Blue", "Green"],
          correct: 1,
        },
      ],
      history: [
        {
          question: "In which year did World War II end?",
          options: ["1943", "1944", "1945", "1946"],
          correct: 2,
        },
        {
          question: "Who was the first President of the United States?",
          options: [
            "Thomas Jefferson",
            "George Washington",
            "John Adams",
            "Benjamin Franklin",
          ],
          correct: 1,
        },
        {
          question:
            "The Great Wall of China was built to protect against which group?",
          options: ["Mongols", "Japanese", "British", "French"],
          correct: 0,
        },
        {
          question: "Which empire built Machu Picchu?",
          options: ["Maya", "Aztec", "Inca", "Olmec"],
          correct: 2,
        },
        {
          question: "Who painted the Mona Lisa?",
          options: [
            "Michelangelo",
            "Leonardo da Vinci",
            "Raphael",
            "Donatello",
          ],
          correct: 1,
        },
      ],
      science: [
        {
          question: "What is the chemical symbol for water?",
          options: ["H2O", "CO2", "O2", "N2"],
          correct: 0,
        },
        {
          question: "How many planets are in our solar system?",
          options: ["7", "8", "9", "10"],
          correct: 1,
        },
        {
          question: "What is the speed of light?",
          options: [
            "300,000 km/s",
            "150,000 km/s",
            "500,000 km/s",
            "1,000,000 km/s",
          ],
          correct: 0,
        },
        {
          question: "What is the largest organ in the human body?",
          options: ["Heart", "Brain", "Liver", "Skin"],
          correct: 3,
        },
        {
          question: "What gas do plants absorb from the atmosphere?",
          options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
          correct: 2,
        },
      ],
      entertainment: [
        {
          question: "Which movie won the Oscar for Best Picture in 2020?",
          options: ["Joker", "1917", "Parasite", "Once Upon a Time"],
          correct: 2,
        },
        {
          question: "Who is known as the 'King of Pop'?",
          options: ["Elvis Presley", "Michael Jackson", "Prince", "Madonna"],
          correct: 1,
        },
        {
          question: "How many Harry Potter books are there?",
          options: ["5", "6", "7", "8"],
          correct: 2,
        },
        {
          question: "Which streaming service created Stranger Things?",
          options: ["Hulu", "Amazon Prime", "Netflix", "Disney+"],
          correct: 2,
        },
        {
          question: "Who directed the movie Inception?",
          options: [
            "Steven Spielberg",
            "Christopher Nolan",
            "James Cameron",
            "Quentin Tarantino",
          ],
          correct: 1,
        },
      ],
    };

    return questionBank[category] || questionBank.animals;
  };

  const generateWord = (category) => {
    const wordBank = {
      objects: [
        "Chair",
        "Lamp",
        "Phone",
        "Book",
        "Pen",
        "Table",
        "Clock",
        "Mirror",
      ],
      places: [
        "Beach",
        "Mountain",
        "Desert",
        "Forest",
        "City",
        "Village",
        "Island",
        "Valley",
      ],
      actions: [
        "Running",
        "Swimming",
        "Dancing",
        "Singing",
        "Cooking",
        "Reading",
        "Writing",
        "Jumping",
      ],
      animals: [
        "Dog",
        "Cat",
        "Bird",
        "Fish",
        "Elephant",
        "Lion",
        "Tiger",
        "Bear",
      ],
    };

    const words = wordBank[category] || wordBank.objects;
    return words[Math.floor(Math.random() * words.length)];
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);

    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        handleGameEnd();
      }
    }, 1000);
  };

  const handleStartVoting = () => {
    setVotingStarted(true);
  };

  const handleVotePlayer = async (playerId) => {
    setSelectedPlayer(playerId);

    // Wait a bit then end game
    setTimeout(() => {
      handleGameEnd();
    }, 1000);
  };

  const handleGameEnd = async () => {
    if (!roomData || !currentUser) return;

    try {
      // Update player score
      const updatedPlayers = roomData.players.map((player) => {
        if (player.uid === currentUser.uid) {
          if (roomData.gameId === 1) {
            return { ...player, score: score };
          } else if (roomData.gameId === 2) {
            return { ...player, vote: selectedPlayer, isImposter: isImposter };
          }
        }
        return player;
      });

      await updateDoc(doc(db, "rooms", roomId), {
        players: updatedPlayers,
        status: "finished",
      });
    } catch (error) {
      console.error("Error ending game:", error);
      toast.error("Failed to submit results");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ffaa0009]">
        <Loader2 className="size-8 animate-spin text-[#fa5c00]" />
      </div>
    );
  }

  // Trivia Game UI
  if (roomData?.gameId === 1) {
    return (
      <div className="p-5 relative bg-[#ffaa0009] min-h-screen w-full">
        {/* Header */}
        <nav className="flex w-full items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-[#fa5c00]" />
            <span className="font-bold text-lg">{score}</span>
          </div>
          <h1 className="changa text-3xl flex items-center">
            <HyperText animateOnHover={false} duration={1500}>
              Join
            </HyperText>
            <HyperText
              className="text-[#fa5c00]"
              animateOnHover={false}
              duration={1500}
            >
              Up
            </HyperText>
          </h1>
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-[#fa5c00]" />
            <span className="font-bold text-lg">{timeLeft}s</span>
          </div>
        </nav>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-[#1a1a1a] rounded-full h-2">
            <div
              className="bg-[#fa5c00] h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          {questions.length > 0 && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-center">
                  {questions[currentQuestion]?.question}
                </h2>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {questions[currentQuestion]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-xl font-semibold text-lg transition-all ${
                      selectedAnswer === index
                        ? index === questions[currentQuestion].correct
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : selectedAnswer !== null &&
                            index === questions[currentQuestion].correct
                          ? "bg-green-500 text-white"
                          : "bg-white hover:bg-gray-100 text-black"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Imposter Game UI
  if (roomData?.gameId === 2) {
    return (
      <div className="p-5 relative bg-[#ffaa0009] min-h-screen w-full">
        {/* Header */}
        <nav className="flex w-full items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-[#fa5c00]" />
            <span className="font-bold text-lg">{roomData.players.length}</span>
          </div>
          <h1 className="changa text-3xl flex items-center">
            <HyperText animateOnHover={false} duration={1500}>
              Join
            </HyperText>
            <HyperText
              className="text-[#fa5c00]"
              animateOnHover={false}
              duration={1500}
            >
              Up
            </HyperText>
          </h1>
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-[#fa5c00]" />
            <span className="font-bold text-lg">{timeLeft}s</span>
          </div>
        </nav>

        {!wordsRevealed && !votingStarted ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <p className="text-sm text-gray-600 mb-4">Your Word:</p>
              <h1
                className={`text-5xl font-bold ${isImposter ? "text-red-500" : "text-[#fa5c00]"}`}
              >
                {assignedWord}
              </h1>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-6 text-white text-center max-w-md">
              <p className="text-sm mb-4">
                {isImposter
                  ? "You are the IMPOSTER! Try to blend in without revealing yourself."
                  : "Ask questions to find the imposter. Don't reveal your word!"}
              </p>
              <p className="text-xs text-white/70">
                Discuss with other players. When time runs out, you'll see
                everyone's words.
              </p>
            </div>
          </div>
        ) : wordsRevealed && !votingStarted ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">
              Words Revealed!
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomData.players.map((player) => (
                <div
                  key={player.uid}
                  className={`p-5 rounded-xl border-2 ${
                    player.assignedWord === "IMPOSTER"
                      ? "bg-red-50 border-red-500"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-full ${player.assignedWord === "IMPOSTER" ? "bg-red-500" : "bg-[#fa5c00]"} flex items-center justify-center text-white font-bold text-lg`}
                    >
                      {player.displayName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {player.displayName}
                      </p>
                      {player.isHost && (
                        <span className="text-xs text-gray-500">Host</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Word:</p>
                    <p
                      className={`text-2xl font-bold ${player.assignedWord === "IMPOSTER" ? "text-red-600" : "text-[#fa5c00]"}`}
                    >
                      {player.assignedWord}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setVotingStarted(true)}
                className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90 rounded-full h-14 px-12 text-lg font-semibold"
              >
                Proceed to Vote
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">
              Vote for the Imposter
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {roomData.players.map((player) => (
                <button
                  key={player.uid}
                  onClick={() => handleVotePlayer(player.uid)}
                  disabled={selectedPlayer !== null}
                  className={`p-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 ${
                    selectedPlayer === player.uid
                      ? "bg-[#fa5c00] text-white"
                      : "bg-white hover:bg-gray-100 text-black"
                  } ${selectedPlayer !== null && selectedPlayer !== player.uid ? "opacity-50" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#fa5c00] flex items-center justify-center text-white font-bold">
                    {player.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <span>{player.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default GamePage;
