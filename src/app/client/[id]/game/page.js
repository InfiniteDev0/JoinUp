"use client";

import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import { Clock, Loader2, Trophy, Users, X } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
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
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const hasRedirectedRef = React.useRef(false);

  // Helper functions - declared before useEffects to avoid hoisting issues
  const generateTriviaQuestions = (category) => {
    const questionBank = {
      animals: [
        {
          question: "What is the largest land animal?",
          options: ["Elephant", "Giraffe", "Rhino", "Hippo"],
          correct: 0,
        },
        {
          question: "Which animal is known as the 'King of the Jungle'?",
          options: ["Tiger", "Lion", "Leopard", "Cheetah"],
          correct: 1,
        },
        {
          question: "What is the fastest land animal?",
          options: ["Cheetah", "Lion", "Horse", "Gazelle"],
          correct: 0,
        },
        {
          question: "Which bird cannot fly?",
          options: ["Sparrow", "Eagle", "Penguin", "Parrot"],
          correct: 2,
        },
        {
          question: "What is the largest ocean animal?",
          options: ["Shark", "Blue Whale", "Dolphin", "Orca"],
          correct: 1,
        },
      ],
      places: [
        {
          question: "Which is the tallest mountain in the world?",
          options: ["K2", "Everest", "Kilimanjaro", "Denali"],
          correct: 1,
        },
        {
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correct: 2,
        },
        {
          question: "Which country is known as the Land of the Rising Sun?",
          options: ["China", "Korea", "Japan", "Thailand"],
          correct: 2,
        },
        {
          question: "What is the largest desert in the world?",
          options: ["Sahara", "Gobi", "Kalahari", "Arabian"],
          correct: 0,
        },
        {
          question: "Which river is the longest in the world?",
          options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
          correct: 1,
        },
      ],
      objects: [
        {
          question: "What device is used to measure temperature?",
          options: ["Barometer", "Thermometer", "Hygrometer", "Speedometer"],
          correct: 1,
        },
        {
          question: "Which object is used to tell time?",
          options: ["Compass", "Clock", "Ruler", "Scale"],
          correct: 1,
        },
        {
          question: "What is used to write on a blackboard?",
          options: ["Pen", "Pencil", "Chalk", "Marker"],
          correct: 2,
        },
        {
          question: "Which object helps you see in the dark?",
          options: ["Mirror", "Flashlight", "Magnifier", "Binoculars"],
          correct: 1,
        },
        {
          question: "What do you use to cut paper?",
          options: ["Scissors", "Knife", "Blade", "Saw"],
          correct: 0,
        },
      ],
      actions: [
        {
          question: "What action do you do when you are tired?",
          options: ["Jump", "Sleep", "Run", "Dance"],
          correct: 1,
        },
        {
          question: "What do you do with food?",
          options: ["Throw", "Eat", "Break", "Paint"],
          correct: 1,
        },
        {
          question: "What action requires water?",
          options: ["Flying", "Swimming", "Walking", "Singing"],
          correct: 1,
        },
        {
          question: "What do you do with music?",
          options: ["Read", "Write", "Listen", "Build"],
          correct: 2,
        },
        {
          question: "What action makes you move faster?",
          options: ["Walking", "Running", "Sitting", "Standing"],
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

  useEffect(() => {
    // Get current user
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      setCurrentUser(JSON.parse(userDetails));
    }

    // Prevent navigation away from game page for non-host players
    const handleBeforeUnload = (e) => {
      const user = JSON.parse(localStorage.getItem("userDetails") || "{}");
      const isHost = roomData?.players?.find((p) => p.uid === user.uid)?.isHost;

      if (!isHost && roomData?.status === "playing") {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Listen to room updates
    if (roomId) {
      const unsubscribe = onSnapshot(doc(db, "rooms", roomId), (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setRoomData({ id: doc.id, ...data });

          // Store room ID to persist on refresh
          localStorage.setItem("currentRoomId", roomId);
          localStorage.setItem("currentGameStatus", data.status);

          // Check if game finished
          if (data.status === "finished" && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.push(`/client/${params.id}/result?room=${roomId}`);
            return;
          }

          // Check if game ended by host
          if (data.status === "ended" && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            toast.success("Game ended by host");
            localStorage.removeItem("currentRoomId");
            localStorage.removeItem("currentGameStatus");
            localStorage.removeItem("currentRoomData");
            setTimeout(() => {
              router.push(`/client/${params.id}`);
            }, 500);
            return;
          }
        } else {
          // Room was deleted
          if (!loading && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            toast.info("Game has ended");
            localStorage.removeItem("currentRoomId");
            localStorage.removeItem("currentGameStatus");
            setTimeout(() => {
              router.push(`/client/${params.id}`);
            }, 500);
          }
        }
        setLoading(false);
      });

      return () => {
        unsubscribe();
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [roomId, params.id, router, roomData]);

  // Initialize game based on type
  useEffect(() => {
    if (roomData && currentUser) {
      if (roomData.gameId === 1) {
        // Trivia game - timer starts immediately
        setTimeLeft(roomData.timer);
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
          setIsPlayerReady(currentPlayerData.isGameReady || false);
          setWordsRevealed(roomData.wordsRevealed || false);

          // Check if all players are ready to start timer
          const allReady = roomData.players.every((p) => p.isGameReady);
          if (allReady) {
            if (!timerStarted) {
              setTimeLeft(roomData.timer);
              setTimerStarted(true);
            }
          } else {
            // Not all ready yet, reset timer state
            setTimerStarted(false);
          }
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
      // Check if words are already assigned to prevent duplicate assignment
      const alreadyAssigned = roomData.players.some((p) => p.assignedWord);
      if (alreadyAssigned) return;

      // Host assigns words to all players
      const imposterIndex = Math.floor(Math.random() * roomData.players.length);
      const word = generateWord(roomData.category);

      const updatedPlayers = roomData.players.map((player, index) => ({
        ...player,
        assignedWord: index === imposterIndex ? "IMPOSTER" : word,
        isGameReady: false, // Reset ready status
      }));

      try {
        await updateDoc(doc(db, "rooms", roomId), {
          players: updatedPlayers,
          wordsAssigned: true,
        });
        console.log("Words assigned to all players");
      } catch (error) {
        console.error("Error assigning words:", error);
      }
    }

    // Wait for host to assign words
    // The useEffect will re-run when roomData updates
  };

  // Timer countdown - Only for host in Imposter game
  useEffect(() => {
    // For Trivia, everyone counts down. For Imposter, only host counts down
    const isHost = roomData?.players.find(
      (p) => p.uid === currentUser?.uid,
    )?.isHost;
    const shouldCountDown =
      roomData?.gameId === 1 ||
      (roomData?.gameId === 2 && timerStarted && isHost);

    if (timeLeft > 0 && shouldCountDown) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && roomData && shouldCountDown) {
      if (roomData.gameId === 1) {
        handleGameEnd();
      } else if (roomData.gameId === 2) {
        // Timer ended - show time's up notification for host
        // Don't auto-reveal, wait for host to click reveal
      }
    }
  }, [timeLeft, roomData, timerStarted, currentUser]);

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
        // Don't end game here, wait for timer
        setSelectedAnswer(null);
      }
    }, 1000);
  };

  const handleReady = async () => {
    if (!roomData || !currentUser || isPlayerReady) return;

    try {
      const updatedPlayers = roomData.players.map((player) => {
        if (player.uid === currentUser.uid) {
          return { ...player, isGameReady: true };
        }
        return player;
      });

      // Check if all players are ready
      const allReady = updatedPlayers.every((p) => p.isGameReady);

      await updateDoc(doc(db, "rooms", roomId), {
        players: updatedPlayers,
        allPlayersReady: allReady, // Add flag to track when timer should start
      });

      setIsPlayerReady(true);
      toast.success("You are ready!");

      if (allReady) {
        toast.success("All players ready! Timer starting...");
        setTimerStarted(true);
      }
    } catch (error) {
      console.error("Error marking ready:", error);
      toast.error("Failed to mark ready");
    }
  };

  const handleEndRoom = async () => {
    if (!roomData || !currentUser) return;

    // Check if user is host
    const isHost = roomData.players.find(
      (p) => p.uid === currentUser.uid,
    )?.isHost;

    if (!isHost) {
      toast.error("Only the host can end the room");
      return;
    }

    try {
      // Update room status to 'ended' to notify all players
      await updateDoc(doc(db, "rooms", roomId), {
        status: "ended",
      });

      // Clear room data from localStorage
      localStorage.removeItem("currentRoomId");
      localStorage.removeItem("currentGameStatus");
      localStorage.removeItem("currentRoomData");

      // Delete room after a delay to ensure all clients get the update
      setTimeout(async () => {
        try {
          await deleteDoc(doc(db, "rooms", roomId));
        } catch (error) {
          console.error("Error deleting room:", error);
        }
      }, 2000);

      toast.success("Game ended");
      setTimeout(() => {
        router.push(`/client/${params.id}`);
      }, 500);
    } catch (error) {
      console.error("Error ending room:", error);
      toast.error("Failed to end room");
    }
  };

  const handleRevealImposter = async () => {
    if (!roomData || !currentUser) return;

    // Check if user is host
    const isHost = roomData.players.find(
      (p) => p.uid === currentUser.uid,
    )?.isHost;

    if (!isHost) {
      toast.error("Only the host can reveal the imposter");
      return;
    }

    try {
      // Update room to show words revealed
      await updateDoc(doc(db, "rooms", roomId), {
        wordsRevealed: true,
      });
      setWordsRevealed(true);
    } catch (error) {
      console.error("Error revealing imposter:", error);
      toast.error("Failed to reveal imposter");
    }
  };

  const handleGameEnd = async () => {
    if (!roomData || !currentUser) return;

    try {
      // Check if already finished (prevent duplicate submissions)
      if (roomData.status === "finished") return;

      // Update player score
      const updatedPlayers = roomData.players.map((player) => {
        if (player.uid === currentUser.uid) {
          if (roomData.gameId === 1) {
            return { ...player, score: score, hasSubmitted: true };
          } else if (roomData.gameId === 2) {
            return {
              ...player,
              vote: selectedPlayer,
              isImposter: isImposter,
              hasSubmitted: true,
            };
          }
        }
        return player;
      });

      // When timer reaches 0, end game immediately
      // When called from handleAnswerSelect/handleVote, wait for all players
      const isTimerEnd = timeLeft === 0;
      const allSubmitted = updatedPlayers.every((p) => p.hasSubmitted);

      await updateDoc(doc(db, "rooms", roomId), {
        players: updatedPlayers,
        status: isTimerEnd || allSubmitted ? "finished" : "playing",
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
    const isHost = roomData.players.find(
      (p) => p.uid === currentUser?.uid,
    )?.isHost;
    const showWordsRevealed = wordsRevealed || roomData.wordsRevealed;

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
          {/* Only host sees small timer in header */}
          {isHost && timerStarted && timeLeft > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-[#fa5c00]" />
              <span className="font-bold text-lg">{timeLeft}s</span>
            </div>
          )}
          {!isHost || !timerStarted || timeLeft === 0 ? (
            <div className="w-16" />
          ) : null}
        </nav>

        {/* Big Timer Display - Only for host when game is running */}
        {isHost && timerStarted && timeLeft > 0 && !showWordsRevealed && (
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative w-56 h-56">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  stroke="#fa5c00"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${(timeLeft / roomData.timer) * 628} 628`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold">
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  ⏰{" "}
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Time's Up notification - Only for host */}
        {isHost && timeLeft === 0 && timerStarted && !showWordsRevealed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[50vh] gap-6"
          >
            <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl p-10 shadow-2xl text-center max-w-md">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-7xl mb-4"
              >
                ⏰
              </motion.div>
              <h2 className="text-5xl font-bold text-white mb-3">
                Time&apos;s Up!
              </h2>
              <p className="text-white/90 text-xl">Discussion time is over</p>
            </div>

            <Button
              onClick={handleRevealImposter}
              className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90 rounded-full h-16 px-12 text-xl font-semibold shadow-lg"
            >
              Reveal Imposter
            </Button>
          </motion.div>
        )}

        {!showWordsRevealed &&
        (isHost ? timeLeft > 0 || !timerStarted : true) ? (
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
                  : "Give one-word clues about your word. Try to find the imposter!"}
              </p>
              <p className="text-xs text-white/70 mb-4">
                {timerStarted
                  ? "Timer is running. Discuss with other players to find the imposter."
                  : "Click ready when you've seen your word. Timer starts when all players are ready."}
              </p>
            </div>

            {/* End Game Button - Only for host when timer is running */}
            {isHost && timerStarted && (
              <Button
                onClick={handleEndRoom}
                variant="outline"
                className="w-full max-w-md h-12 rounded-full text-base font-semibold border-red-500 text-red-500 hover:bg-red-50"
              >
                End Game
              </Button>
            )}

            {!timerStarted && (
              <div className="w-full max-w-md space-y-4">
                <Button
                  onClick={handleReady}
                  disabled={isPlayerReady}
                  className={`w-full h-14 rounded-full text-lg font-semibold ${
                    isPlayerReady
                      ? "bg-green-500 hover:bg-green-500"
                      : "bg-[#fa5c00] hover:bg-[#fa5c00]/90"
                  }`}
                >
                  {isPlayerReady ? "✓ Ready" : "I'm Ready"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Waiting for players:{" "}
                    {roomData.players.filter((p) => p.isGameReady).length} /{" "}
                    {roomData.players.length}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {roomData.players.map((player) => (
                      <div
                        key={player.uid}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          player.isGameReady
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {player.displayName} {player.isGameReady && "✓"}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Host can end room if players don't join */}
                {roomData.players.find((p) => p.uid === currentUser?.uid)
                  ?.isHost && (
                  <Button
                    onClick={handleEndRoom}
                    variant="outline"
                    className="w-full h-12 rounded-full border-red-500 text-red-500 hover:bg-red-50 gap-2"
                  >
                    <X className="size-4" />
                    End Room
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : showWordsRevealed ? (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center mb-6">
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
                      className={`text-3xl font-bold ${player.assignedWord === "IMPOSTER" ? "text-red-600" : "text-[#fa5c00]"}`}
                    >
                      {player.assignedWord}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Only host can end game */}
            {isHost && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={async () => {
                    try {
                      await updateDoc(doc(db, "rooms", roomId), {
                        status: "finished",
                      });
                    } catch (error) {
                      console.error("Error ending game:", error);
                    }
                  }}
                  className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90 rounded-full h-14 px-12 text-lg font-semibold"
                >
                  End Game
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return null;
};

export default GamePage;
