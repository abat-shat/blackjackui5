sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../service/DeckService",
    "../service/PlayerHandService",
    "../service/DealerHandService"
], 
/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel
 * @param {typeof sap.m.MessageBox} MessageBox
 * @param {*} DeckService
 * 
 */
function(Controller, JSONModel, MessageBox, MessageToast,
         DeckService, PlayerHandService, DealerHandService) {
    "use strict";

    Controller.extend("de.abatgroup.blackjackui5.controller.Play", {
        NUMBER_OF_CARDS_IN_A_HAND : 5,
        MAIN_HAND : 0,
        SPLIT_HAND : 1,
        PREMATURE_CONCLUSION : {
            BOTH_HAS_BLACKJACK : "BOTH_HAS_BLACKJACK",
            DEALER_HAS_BLACKJACK : "DEALER_HAS_BLACKJACK",
            PLAYER_HAS_BLACKJACK : "PLAYER_HAS_BLACKJACK",
            PLAYER_SURRENDERED : "PLAYER_SURRENDERED",
            PLAYER_HANDS_CONCLUDED : "PLAYER_HANDS_CONCLUDED",
            BOTH_HANDS_BLACKJACK : "BOTH_HANDS_BLACKJACK"
        },
        RESULT : {
            WON : "WON",
            LOST : "LOST",
            PUSH : "PUSH",
            BLACKJACK : "BLACKJACK",
            SURRENDERED : "SURRENDERED",
            BUSTED : "BUSTED",
            CHARLIE : "5-CARD CHARLIE"
        },
        _deckService : undefined,
        _playerServices : [],
        _playerServicesConcluded : [],
        _dealerService : undefined,
        /* ================================================================================
         * View initialization
         * ================================================================================
         */

        onInit: function(){    
            this._resetModel();
            this.onUsername();
        },

        onUsername: function(){
            let self = this;
            sap.ui.require(["sap/ushell/Container"], async function (Container) {
                const userInfo = await Container.getServiceAsync("UserInfo");
                const userId = userInfo.getId();
                const usernameData = {
                    "name" : userId
                };
                const usernameModel = new JSONModel(usernameData);
                usernameModel.setDefaultBindingMode("OneWay");
                self.getView().setModel(usernameModel, "user");
            });
            
        },

        /* ================================================================================
         * On new round
         * ================================================================================
         */

        onNewRound: function(){
            let betAmountLastRound = this.coins().getProperty("/bet/amount");
            this._resetModel(betAmountLastRound);
            this._resetViewResources();
            this._resetServiceResources();            
            this._enableResult(false);
        },
        _resetModel: function(betAmount = 0){
            const coinsData = {
                "user" : {
                    "available" : 0,
                    "bonus" : 0
                },
                "bet" : {
                    "amount" : betAmount,
                    "split" : 0
                }
            };
            const coinsModel = new JSONModel(coinsData);
            this.getView().setModel(coinsModel, "coins");

            const tabletopData = {
                "draw" : {
                    "counter" : 0
                },
                "player" : {
                    "score" : 0,
                    "cardCount" : 0,
                    "split" : {
                        "score" : 0
                    }
                },
                "dealer" : {
                    "score" : 0,
                    "cardCount" : 0
                },
                "result" : {
                    "main" : {
                        "text" : "",
                        "coins" : 0
                    },
                    "split" : {
                        "text" : "",
                        "coins" : 0
                    }
                }
            };
            const tabletopModel = new JSONModel(tabletopData);
            this.getView().setModel(tabletopModel, "tabletop");
        },
        /**
         * Reset FE resources
         */
        _resetViewResources: function() {
           
            this._requestAvailableAndBonusCoin();
            this._resetPlayerAndDealerHand();
            this._resetAllPlayButtons();
            this._enableBettingOptions(true);
            
        },
        /**
         * Reset BE resources
         */
        _resetServiceResources: function() {
            this._deckService = new DeckService();
            this._deckService.shuffle();
            this._dealerService = new DealerHandService();
            this._playerServices.length = 0;
            this._playerServices.push(new PlayerHandService());
            this._playerServicesConcluded.length = 0;
        },

        _requestAvailableAndBonusCoin: function() {
            const oDataModel = this.getOwnerComponent().getModel();
            //TODO
            const oContext = oDataModel.bindContext("/Coin('SHIT')");
            oContext.requestObject("AbatCoin").then((availableCoin) => {
                this.coins().setProperty("/user/available", availableCoin);
            })
            .catch(() => MessageBox.error("User not registered."));
            oContext.requestObject("Bonus").then((bonus) => {
                this.coins().setProperty("/user/bonus", bonus);
            });
        },

        _resetPlayerAndDealerHand: function() {

            let dealerFacedownSrc = this.getOwnerComponent().getModel("img").getProperty("/decks/red");
            let playerFacedownSrc = this.getOwnerComponent().getModel("img").getProperty("/decks/green");
            let playerSplitFacedownSrc = this.getOwnerComponent().getModel("img").getProperty("/decks/green");
            for (let index = 1; index <= this.NUMBER_OF_CARDS_IN_A_HAND; index++) {
                this.getView().byId("dealerCard" + index).setSrc(dealerFacedownSrc);
                this.getView().byId("playerCard" + index).setSrc(playerFacedownSrc);
                this.getView().byId("playerSplitCard" + index).setSrc(playerSplitFacedownSrc);
                
            }

            this._enableSplitHand(false);
            
        },

        _resetAllPlayButtons: function() {
            this._enableButton("draw", false);
            this._enableButton("surrender", false);
            this._enableButton("split", false);
            this._enableButton("doubleDown", false);
            this._enableButton("hit", false);
            this._enableButton("stay", false);
            this._enableButton("continue", false);
            this._enableButton("newRound", false);
        },

        /* ================================================================================
         * On inputting bet amount
         * ================================================================================
         */
        
        /**
         * On user confirming bet amount. Will be called repeatedly until the input is valid.
         */
        onConfirmBetCoinsAmount: function(){
            
            if (this._isBetSuccessful()) {
                this._enableBettingOptions(false);
                this._enableButton("draw", true);
            }
        },
        
        /**
         * 
         * @param {int} amount 
         */
        onAddToBetAmount: function(amount){
            const currentAmount = this.coins().getProperty("/bet/amount");
            const parsedCurrentAmount = Number(currentAmount) || 0;
            this.coins().setProperty("/bet/amount", parsedCurrentAmount + amount);
            
        },

        onAllIn: function(){
            let available = Number(this.coins().getProperty("/user/available")) || 0;
            let bonus = Number(this.coins().getProperty("/user/bonus")) || 0;
            this.coins().setProperty("/bet/amount", available + bonus);
        },
        /**
         * Prevents user from inputting anything other than a digit.
         * Source {@link https://community.sap.com/t5/technology-q-a/how-to-make-input-field-accept-only-numeric-values-in-sapui5-using-xml/qaq-p/337331 SAP Community}.
         * @param {typeof sap.ui.base.Event} event The {@link sap.m.Input Input} itself.
         *  
         */
        onCoinAmountInput: function(event){
            let _oInput = event.getSource();
            let val = _oInput.getValue();
            val = val.replace(/[^\d]/g, '');
            _oInput.setValue(val);
        },

        /**
         * Update the user AbatCoin and Bonus in the OData.
         * @returns Whether a Promise to the subtraction was made.
         * False if the user inputted a value <= 0
         * or user does not have enough coin.
         */
        _isBetSuccessful: function() {
            const amount = Number(this.coins().getProperty("/bet/amount"));
            if (amount <= 0) {
                const exMsg = this.i18n().getText("exceptionSmallerThanZero")
                MessageBox.error(exMsg);
                return false;
            }
            
            return this._subtractCoinsFromPlayer(amount);
            
        },
        /* ================================================================================
         * on Drawing Phase.
         * ================================================================================
         */
        onDraw: function() {
            const view = this.getView();
            let drawCounter = this.tabletop().getProperty("/draw/counter");

            const playerService = this._playerServices[this.MAIN_HAND];
            const playerSplitService = this._playerServices[this.SPLIT_HAND];
            const playerCard = this._deckService.draw();
            let playerSrc = this._getCardImgSrc(playerCard.toString());
    
            let dealerCard;
            let playerValue; 
            let dealerValue;

            switch (drawCounter) {
                case 0:
                    dealerCard = this._deckService.draw();
                    playerValue = playerService.addCard(playerCard);
                    dealerValue = this._dealerService.addCard(dealerCard);
                    this.tabletop().setProperty("/player/score", playerValue);
                    this.tabletop().setProperty("/dealer/score", dealerValue);
                    let dealerSrc = this._getCardImgSrc(dealerCard.toString());
                    view.byId("playerCard1").setSrc(playerSrc);
                    view.byId("dealerCard1").setSrc(dealerSrc);
                    break;
                case 1:
                    dealerCard = this._deckService.draw();
                    playerValue = playerService.addCard(playerCard);
                    dealerValue = this._dealerService.addCard(dealerCard);
                    this.tabletop().setProperty("/player/cardCount", 2);
                    this.tabletop().setProperty("/dealer/cardCount", 2);
                    this.tabletop().setProperty("/player/score", playerValue);

                    const oldDealerValue = this.tabletop().getProperty("/dealer/score");
                    this.tabletop().setProperty("/dealer/score", oldDealerValue + " + ?");
                    view.byId("playerCard2").setSrc(playerSrc);

                    this._enableButton("surrender", false);
                    this._enableButton("draw", false);

                    playerService.checkEligibleForSplit() &&
                        this._enableButton("split", true);

                    this._enableButton("doubleDown", true);
                    this._enableButton("hit", true);
                    this._enableButton("stay", true);
                    this._enableButton("surrender", true);

                    this._checkPlayerAndDealerForBlackjack();

                    
                    break;
                // For split
                case 2:
                    playerValue = playerService.addCard(playerCard);
                    this.tabletop().setProperty("/player/score", playerValue);
                    view.byId("playerCard2").setSrc(playerSrc);
                    if (playerService.checkForBlackjack()) {
                        this._onMainHandBlackjack();
                    }
                    
                    break;
                case 3:
                    playerValue = playerSplitService.addCard(playerCard);
                    this.tabletop().setProperty("/player/split/score", playerValue);
                    view.byId("playerSplitCard2").setSrc(playerSrc);
                    
                    this._enableButton("draw", false);
                    this._enableButton("doubleDown", true);
                    this._enableButton("hit", true);
                    this._enableButton("stay", true);

                    //check for BJ
                    if (playerSplitService.checkForBlackjack()) {
                        this._onSplitHandBlackjack();
                    }

                    break;
                default:
                    MessageBox.error("How the hell did this happen");
                    break;
            }

            this.tabletop().setProperty("/draw/counter", drawCounter + 1);


        },

        onSurrender: function() {
            this._onPrematureRoundEnd(this.PREMATURE_CONCLUSION.PLAYER_SURRENDERED);
            this._enableButton("surrender", false);
        },

        _checkPlayerAndDealerForBlackjack: function() {
            let isDealerBj = this._dealerService.hasBlackjack();
            let isPlayerBj = this._playerServices[this.MAIN_HAND].hasBlackjack();

            if (isDealerBj && isPlayerBj) {
                this._onPrematureRoundEnd(this.PREMATURE_CONCLUSION.BOTH_HAS_BLACKJACK);
            }
            else if (isDealerBj) {
                this._onPrematureRoundEnd(this.PREMATURE_CONCLUSION.DEALER_HAS_BLACKJACK);
            }
            else if (isPlayerBj) {
                this._onPrematureRoundEnd(this.PREMATURE_CONCLUSION.PLAYER_HAS_BLACKJACK);
            }

            if (isDealerBj || isPlayerBj) {
                this._playerServices.pop();
            }
        },

        /* ================================================================================
         * on Playing Phase.
         * ================================================================================
         */
        onHit: function() {
            this._addCardToPlayerHand();
            this._checkForBustAndCharlie();

            this._enableButton("doubleDown", false);
            this._enableButton("split", false);
            this._enableButton("surrender", false);

        },
        
        onStay: function() {
            const currentHand = this._playerServices.shift();
            this._playerServicesConcluded.push(currentHand);

            if (this._playerServices.length != 0) {
                this.tabletop().setProperty("/player/cardCount", 2);
                this._enableButton("doubleDown", true);
            }
            else {
                this._enableButton("hit", false);
                this._enableButton("stay", false);
                this._enableButton("doubleDown", false);
                this._enableButton("split", false);
                this._enableButton("continue", true);
                this._revealDealerCard();
            }

            this._enableButton("surrender", false);

        },

        onDoubleDown: function() {
            if (this._isDoubleDownSuccessful()) {
                this._addCardToPlayerHand();
                
                if (!this._checkForBustAndCharlie()) {
                    this.onStay();
                    this._enableButton("split", false);
                    this._enableButton("surrender", false);    
                }
                
            }
            
        },

        onSplit: function() {
            if (this._isSplitSuccessful()) {
                let splitHand = new PlayerHandService();
                let mainHand = this._playerServices[0];
                let splitResult = mainHand.onSplit(splitHand);
                console.log(splitResult)
                this._playerServices.push(splitHand);

                //UI stuff
                // remove 2nd card from main
                let playerFacedownSrc = this.getOwnerComponent().getModel("img").getProperty("/decks/green");
                this.getView().byId("playerCard2").setSrc(playerFacedownSrc);
                this.tabletop().setProperty("/player/score", splitResult[1]);
                
                //add 1st card to split
                const cardSrc = this._getCardImgSrc(splitResult[0].toString());
                this.getView().byId("playerSplitCard1").setSrc(cardSrc);
                this.tabletop().setProperty("/player/split/score", splitResult[2]);


                this._enableSplitHand(true);

                this._resetAllPlayButtons();
                this._enableButton("draw", true);
            }

        },

        _addCardToPlayerHand: function() {
            const card = this._deckService.draw();
            const cardSrc = this._getCardImgSrc(card.toString());
            let totalValue = this._playerServices[0].addCard(card);
            
            let cardCount = this.tabletop().getProperty("/player/cardCount") + 1;
            this.tabletop().setProperty("/player/cardCount", cardCount);

            // again due to bad design choices
            if (this._isCurrentHandMainHand()) {
                this.tabletop().setProperty("/player/score", totalValue);
                this.getView().byId("playerCard" + cardCount).setSrc(cardSrc);
            } else {
                this.tabletop().setProperty("/player/split/score", totalValue);
                this.getView().byId("playerSplitCard" + cardCount).setSrc(cardSrc);
            }
        },
        /**
         * Check the player's current hand, and write the result in the hand service.
         * 
         * If all players hands are processed, the round ends.
         * @returns True if player's current Hand really is busted or has 5 cards.
         */
        _checkForBustAndCharlie: function() {
            if (this._playerServices[0].checkAfterHit()) {
                this.onStay();
                if (this._playerServices.length == 0) {
                    if (this._playerServicesConcluded[0].result) {
                        this._onPrematureRoundEnd(this.PREMATURE_CONCLUSION.PLAYER_HANDS_CONCLUDED);    
                    }
                    
                }
                return true;
            }

            return false;
        },

        _isDoubleDownSuccessful: function(){
            let amount;
            if (this._isCurrentHandMainHand()) {
                amount = Number(this.coins().getProperty("/bet/amount"));
            }
            else {
                amount = Number(this.coins().getProperty("/bet/split"));
            }
            
            if (this._subtractCoinsFromPlayer(amount)) {
                if (this._isCurrentHandMainHand()) {
                    this.coins().setProperty("/bet/amount", amount * 2);
                }
                else {
                    this.coins().setProperty("/bet/split", amount * 2);
                }
                return true;
            }

            return false;
            
        },

        _isSplitSuccessful: function() {
            let amount = Number(this.coins().getProperty("/bet/amount"));
            
            if (this._subtractCoinsFromPlayer(amount)) {
                this.coins().setProperty("/bet/split", amount);
                return true;
            } 
            return false;
            
        },

        /* ================================================================================
         * On dealer's turn.
         * ================================================================================
         */

        onContinue: function() {
            let dealerAction = this._dealerService.determineDealerAction();
            switch (dealerAction) {
                case DealerHandService.DealerAction.DEALER_HIT:
                    this._addCardToDealerHand();
                    break;
                default:
                    this._onRoundEnd(dealerAction);
                    break;
            }
        },

        _addCardToDealerHand: function() {
            const card = this._deckService.draw();
            const cardSrc = this._getCardImgSrc(card.toString());
            let totalValue = this._dealerService.addCard(card);
            
            let cardCount = this.tabletop().getProperty("/dealer/cardCount") + 1;
            this.tabletop().setProperty("/dealer/cardCount", cardCount);

            this.tabletop().setProperty("/dealer/score", totalValue);
            this.getView().byId("dealerCard" + cardCount).setSrc(cardSrc);
        },

        /* ================================================================================
         * on End Phase.
         * ================================================================================
         */
        /**
         * called when the round should end before dealers turn. Used for natural Blackjack,
         * Busting and 5-Card Charlie.
         * 
         * However this will not be called when there are 2 hands, one of which has not concluded yet.
         * @param {string} reason 
         */
        _onPrematureRoundEnd: function(reason) {
            let betAmount = Number(this.coins().getProperty("/bet/amount"));
            let msg;
            let amount = 0;

            let mainText = "";
            let splitText = "";
            let mainCoin = 0;
            let splitCoin = 0;


            switch (reason) {
                case this.PREMATURE_CONCLUSION.BOTH_HAS_BLACKJACK:
                    amount = betAmount;
                    msg = this.i18n().getText("bothHasBlackjack", [amount]);
                    mainText = this.RESULT.PUSH;
                    mainCoin = amount;
                    break;
                case this.PREMATURE_CONCLUSION.DEALER_HAS_BLACKJACK:
                    msg = this.i18n().getText("dealerHasBlackjack");
                    mainText = this.RESULT.LOST;
                    break;
                case this.PREMATURE_CONCLUSION.PLAYER_HAS_BLACKJACK:
                    amount = Math.round(betAmount * 1.5);
                    msg = this.i18n().getText("playerHasBlackjack", [amount]);
                    mainText = this.RESULT.BLACKJACK;
                    mainCoin = amount;
                    break;
                case this.PREMATURE_CONCLUSION.PLAYER_SURRENDERED:
                    amount = Math.round(betAmount * 0.5);
                    msg = this.i18n().getText("playerSurrendered", [amount]);
                    mainText = this.RESULT.SURRENDERED;
                    break;
                case this.PREMATURE_CONCLUSION.PLAYER_HANDS_CONCLUDED:
                    let firstHandResult = this._playerServicesConcluded.shift().result;
                    switch (firstHandResult) {
                        case PlayerHandService.Result.PLAYER_BLACKJACK:
                            amount = Math.round(betAmount * 1.5);
                            msg = this.i18n().getText("resolveMainHandBlackjack", [amount]);
                            mainText = this.RESULT.BLACKJACK;
                            mainCoin = amount;
                            break;
                        case PlayerHandService.Result.PLAYER_BUSTED:
                            msg = this.i18n().getText("mainHandBusted");
                            mainText = this.RESULT.BUSTED;
                            break;
                        case PlayerHandService.Result.PLAYER_CHARLIE:
                            amount = betAmount * 2;
                            msg = this.i18n().getText("mainHandCharlie", [amount]);
                            mainText = this.RESULT.CHARLIE;
                            mainCoin = amount;
                            break;
                        default:
                            MessageBox.error("Hand is not prematurely ended. Rewrite logic.");
                            break;
                    }
                    let secondHand = this._playerServicesConcluded.shift();
                    if (secondHand) {
                        switch (secondHand.result) {
                            case PlayerHandService.Result.PLAYER_BUSTED:
                                msg += "\n" + this.i18n().getText("splitHandBusted");
                                splitText = this.RESULT.BUSTED;
                                break;
                            case PlayerHandService.Result.PLAYER_CHARLIE:
                                betAmount = Number(this.coins().getProperty("/bet/split"));
                                let splitAmount = betAmount * 2;
                                msg = this.i18n().getText("splitHandCharlie", [splitAmount]);
                                amount += splitAmount;
                                splitText = this.RESULT.CHARLIE
                                splitCoin = betAmount;
                                break;
                            default:
                                MessageBox.error("Hand is not prematurely ended. Rewrite logic.");
                                break;
                        }   
                    }
                    break;
                case this.PREMATURE_CONCLUSION.BOTH_HANDS_BLACKJACK:
                    amount = Math.round(Number(betAmount) * 1.5);
                    msg = this.i18n().getText("resolveMainHandBlackjack", [amount]);
                    mainText = this.RESULT.BLACKJACK;
                    mainCoin = amount;

                    let splitAmount = this.coins().getProperty("/bet/split");
                    let bjSplitAmount = Math.round(Number(splitAmount) * 1.5);
                    msg += "\n" + this.i18n().getText("splitHandBlackjack", [bjSplitAmount]);
                    splitText = this.RESULT.BLACKJACK;
                    splitCoin = bjSplitAmount;

                    amount += bjSplitAmount;
                    break;
                default:
                    break;
                
            }
            this._setResult(mainText, splitText, mainCoin, splitCoin);
            this._revealDealerCard();
            MessageToast.show(msg);
            this._addCoinsToPlayer(amount);
            this._resetAllPlayButtons();
            this._enableButton("newRound", true);
            
        },

        _onRoundEnd: function(dealerAction) {
            let currentHand;
            let prefix;
            let betAmount;
            let amount = 0;
            let tempAmount = 0;
            let tempMsg;
            /** @type {string} */
            let msg = "";
            let result;

            let resultText;
            let resultCoin;
            let mainText = "";
            let splitText = "";
            let mainCoin = 0;
            let splitCoin = 0;

            for (let index = 0; index < 2; index++) {
                if (index == 0) {
                    currentHand = this._playerServicesConcluded[this.MAIN_HAND];
                    prefix = "main";
                    betAmount = Number(this.coins().getProperty("/bet/amount"));
                }
                else {
                    currentHand = this._playerServicesConcluded[this.SPLIT_HAND];
                    prefix = "split";
                    betAmount = Number(this.coins().getProperty("/bet/split"));
                }
                
                if (currentHand) {
                    switch (currentHand.result) {
                    // only happens on main Hand
                    case PlayerHandService.Result.PLAYER_BLACKJACK:
                        tempAmount = Math.round(betAmount * 1.5);
                        tempMsg = this.i18n().getText("resolveMainHandBlackjack", [tempAmount]);
                        resultText = this.RESULT.BLACKJACK;
                        resultCoin = tempAmount;
                        break;
                    case PlayerHandService.Result.PLAYER_BUSTED:
                        tempMsg = this.i18n().getText(prefix + "HandBusted");
                        resultText = this.RESULT.BUSTED;
                        break;
                    case PlayerHandService.Result.PLAYER_CHARLIE:
                        tempAmount = betAmount * 2;
                        tempMsg = this.i18n().getText(prefix + "HandCharlie", [tempAmount]);
                        resultText = this.RESULT.CHARLIE;
                        resultCoin = tempAmount;
                        break;
                    default:
                        switch (dealerAction) {
                            case DealerHandService.DealerAction.DEALER_STAY:
                                result = currentHand.calculateResult(this._dealerService, betAmount);
                                tempAmount = result[1];
                                tempMsg = this.i18n().getText(prefix + result[0], [tempAmount]);
                                resultText = result[2];
                                resultCoin = tempAmount;
                                break;
                            case DealerHandService.DealerAction.DEALER_BUSTED:
                                tempAmount = betAmount * 2;
                                tempMsg = this.i18n().getText(prefix + "HandDealerBusted", [tempAmount]);
                                resultText = this.RESULT.WON;
                                resultCoin = tempAmount;
                                break;
                            case DealerHandService.DealerAction.DEALER_CHARLIE:    
                                tempMsg = this.i18n().getText(prefix + "HandDealerCharlie");
                                resultText = this.RESULT.LOST;
                                break;
                        }
                        break;
                }
                if (index == this.MAIN_HAND) {
                    mainText = resultText;
                    mainCoin = resultCoin;
                }
                else {
                    splitText = resultText;
                    splitCoin = resultCoin;
                }
                amount += tempAmount;
                msg += tempMsg + '\n'; 
                }       
            }
            this._setResult(mainText, splitText, mainCoin, splitCoin);
            MessageToast.show(msg);
            this._addCoinsToPlayer(amount);
            this._resetAllPlayButtons();
            this._enableButton("newRound", true);
        },

        _onMainHandBlackjack: function() {
            let playerService = this._playerServices.shift();
            this._playerServicesConcluded.push(playerService);
            let amount = this.coins().getProperty("/bet/amount");
            let bjAmount = Math.round(Number(amount) * 1.5);
            let msg = this.i18n().getText("promiseMainHandBlackjack", [bjAmount]);
            MessageToast.show(msg);
        },
        _onSplitHandBlackjack: function() {
            this._playerServices.pop();
            if (this._playerServices.length == 0) {
                this._onPrematureRoundEnd(this.PREMATURE_CONCLUSION.BOTH_HANDS_BLACKJACK);
            }
            else {
                let splitAmount = this.coins().getProperty("/bet/split");
                let bjSplitAmount = Math.round(Number(splitAmount) * 1.5);
                let msg = this.i18n().getText("splitHandBlackjack", [bjSplitAmount]);
                MessageToast.show(msg);
                this._addCoinsToPlayer(bjSplitAmount);
            }

            
        },
        /**
         * 
         * @param {int} amount 
         */
        _addCoinsToPlayer: function(amount) {
            if (amount == 0) {
                return;
            }

            const oDataModel = this.getView().getModel();
            const oContext = oDataModel.bindContext("/Coin('SHAT')", null, {
                $$updateGroupId: "addCoin"
            });
            let abatCoin = this.coins().getProperty("/user/available");
            let newCoinBalance = Number(abatCoin) + amount; 
            oContext.getBoundContext().setProperty("AbatCoin", newCoinBalance.toString());
            let self = this;
            oDataModel.submitBatch("addCoin").then(
                function success() {
                    console.log("Update successful");
                    self._setBusy(false);
                    self._requestAvailableAndBonusCoin();
                },
                function failed(err) {
                    console.error("Update failed", err);
                    MessageBox.error(self.i18n().getText("exceptionSubmitBatchFailedRefundPlayer", [newCoinBalance, 'SHAT']));
                    self._setBusy(false);
                }
            );
            this._setBusy(true);
            console.log("updated");
        },
        _setResult: function(mainText, splitText, mainCoin, splitCoin) {
            let tabletop = this.tabletop();

            let mainTextI18n = "";
            let splitTextI18n = "";

            if (mainText) {
                mainTextI18n = this.i18n().getText("result" + mainText);
            }

            if (splitText) {
                splitTextI18n = this.i18n().getText("result" + splitText);
            }

            tabletop.setProperty("/result/main/text", mainTextI18n);
            tabletop.setProperty("/result/split/text", splitTextI18n);
            tabletop.setProperty("/result/main/coin", mainCoin);
            tabletop.setProperty("/result/split/coin", splitCoin);

            this._enableResult(true);
        },

        /* ================================================================================
         * Helper functions.
         * ================================================================================
         */

        /**
         * 
         * @param {boolean} isBusy 
         */
        _setBusy: function(isBusy){
            this.getView().setBusy(isBusy);
        },
        /**
         * Helper function to en-/disable betting money. Enabled on start of new round and
         * disabled when user inputted an amount of money.
         * @param {boolean} isEnabled 
         */
        _enableBettingOptions: function(isEnabled) {
            let view = this.getView();
            view.byId("coinInput").setEnabled(isEnabled);
            view.byId("betButton").setEnabled(isEnabled);
            view.byId("add10Button").setEnabled(isEnabled);
            view.byId("add50Button").setEnabled(isEnabled);
            view.byId("add100Button").setEnabled(isEnabled);
            view.byId("allInButton").setEnabled(isEnabled);
        },
        /**
         * 
         * @param {string} buttonName 
         * @param {boolean} isEnabled 
         */
        _enableButton: function(buttonName ,isEnabled) {
            this.getView().byId(buttonName + "Button").setEnabled(isEnabled);
        },
        /**
         * 
         * @param {string} sCard Card representation in string. Ex: 2S is 2 of Spades
         * @returns Relative path to the corresponding card image.
         */
        _getCardImgSrc: function(sCard){
            return this.getOwnerComponent().getModel("img").getProperty("/cards/" + sCard);
        },
        /**
         * Update user's coin in the OData. The model coins will be automatically
         * updated if the update succeeded.
         * @param {int} amount to be subtracted.
         * @returns if update was successful
         */
        _subtractCoinsFromPlayer: function(amount) {
            const availableCoin = Number(this.coins().getProperty("/user/available"));
            const bonusCoin = Number(this.coins().getProperty("/user/bonus"));
            if (amount > (availableCoin + bonusCoin)) {
                
                const exMsg = this.i18n().getText("exceptionNotEnoughCoin");
                MessageBox.error(exMsg);
                return false;
            }

            const oDataModel = this.getView().getModel();
            const oContext = oDataModel.bindContext("/Coin('SHAT')", null, {
                $$updateGroupId: "availableCoin"
            });
 
            const newBonusBalance = bonusCoin - amount;
            if (newBonusBalance >= 0) {
                // bonus is enough
                oContext.getBoundContext().setProperty("Bonus", newBonusBalance.toString());
            } else {
                // subtract availableCoin as well
                oContext.getBoundContext().setProperty("Bonus", "0");
                const newCoinBalance = availableCoin + newBonusBalance;
                oContext.getBoundContext().setProperty("AbatCoin", newCoinBalance.toString());
            }
           
            let self = this;
            oDataModel.submitBatch("availableCoin").then(
                function success() {
                    console.log("Update successful");
                    self._setBusy(false);
                    self._requestAvailableAndBonusCoin();
                },
                function failed(err) {
                    console.error("Update failed", err);
                    MessageBox.error(self.i18n().getText("exceptionSubmitBatchFailed"));
                    self._setBusy(false);
                }
            );
            this._setBusy(true);
            console.log("updated");
            return true;
        },
        /**
         * Check which hand is being worked on.
         * @returns True if Main Hand
         * 
         * False if Split Hand
         */
        _isCurrentHandMainHand: function(){
            return this._playerServicesConcluded.length == 0;
        },
        _enableSplitHand: function(isEnabled) {
            this.getView().byId("playerSplitHandHBox").setVisible(isEnabled);
            this.getView().byId("playerSplitHandTextHBox").setVisible(isEnabled);

        },
        _revealDealerCard: function(){
            let result = this._dealerService.getSecondCardAndTotalValue();
            let cardSrc = this._getCardImgSrc(result[0].toString());
            this.getView().byId("dealerCard2").setSrc(cardSrc);
            this.tabletop().setProperty("/dealer/score", result[1]);
        },
        _enableResult: function(isEnabled) {
            let view = this.getView();
            view.byId("playerHandResultHBox").setVisible(isEnabled);
            view.byId("playerSplitResultHBox").setVisible(isEnabled);
        },
        /* ================================================================================
         * Model getters.
         * ================================================================================
         */

        tabletop() {
            return this.getView().getModel("tabletop");
        },

        coins() {
            return this.getView().getModel("coins");
        },

        i18n() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onTest: function() {      
            // this._deckService.manipulateSplitBlackjack();
            // this._deckService.manipulateBothBlackjack();
            // this._deckService.manipulateBlackjack();
            // this._deckService.manipulatePush();

            let emptyString = "";
            if (emptyString) {
                console.log(true);
            }
            console.log(false);

        }
    });
});

