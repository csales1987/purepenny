define(
	['helpers/jquery'],
	function ($) {
		return {
			creator: function (sandbox) {
				var moduleContainer = document.getElementById(sandbox.getOption('id')),
					expireSeconds = sandbox.getOption('expireSeconds'),
					$auctionTimer = $('.auction-timer', moduleContainer),
					$auctionTimerSpan = $('.auction-timer span', moduleContainer),
					auctionExpireDate = getExpireTime(),
					$auctionPriceSpan = $('.auction-price span', moduleContainer),
					$bidButton = $('.bid-button-wrapper button', moduleContainer),
					$bidButtonSpan = $('.bid-button-wrapper button span', moduleContainer),
					timerID;

				var create = function () {
					//$(moduleContainer).css('display','none');
					setup();
				};

				function setup() {
					startTimer();
					initializeBidButtons();
				}

				function auctionTimer() {
					var timeRemaining = new Number((auctionExpireDate.getTime() - new Date().getTime())/1000).toFixed(0);
					if(timeRemaining > 0) {
						if(timeRemaining <= 10) {
							$($auctionTimer).addClass('expiring');
						}
						if(timeRemaining <= 60) {
							$($auctionTimer).addClass('under-minute');
						}
						$($auctionTimerSpan).text(":"+timeRemaining);
					}
					else {
						$($auctionTimerSpan).text(":"+timeRemaining);
						stopTimer();
					}
				}

				function getExpireTime() {
					var d = new Date();
					d.setTime(d.getTime() + expireSeconds*1000);
					return d;
				}

				function startTimer() {
					timerID = setInterval(auctionTimer, 500);
					auctionTimer();
				}

				function stopTimer() {
					clearInterval(timerID);
					timerID = null;
				}

				function initializeBidButtons() {
					$($bidButton).on('mousedown',bidButtonActions);
				}

				function formattedTimeRemaining(timeRemaining) {
					var formattedTime;
					if(timeRemaining.getSeconds() > 60) {
						if(timeRemaining.getMinutes() > 60) {
							formattedTime = timeRemaining.getHours() + ":" + timeRemaining.getMinutes() + ":" + timeRemaining.getSeconds;
						}
						else
							formattedTime = timeRemaining.getMinutes() + ":" + timeRemaining.getSeconds;
					}
					else 
						formattedTime = ":" + timeRemaining.getSeconds();

					return formattedTime;
				}

				function bidButtonActions(ev) {
					changeBidButtonToMe();
					incrementPrice();
					
				}

				function incrementPrice() {
					var price = $($auctionPriceSpan).text();
					price = price.replace("$","");
					price = Number(parseFloat(Number(price).toFixed(2)) + parseFloat(.01)).toFixed(2);
					$($auctionPriceSpan).text('$' + price);
				}

				function changeBidButtonToMe() {
					$($bidButton).removeClass().addClass('me').attr('disabled',true);
					$($bidButtonSpan).text('me');
				}

				return {
					create: create
				};
			}
		};
	}
);