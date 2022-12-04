//============================================================
//CAREER QUIZ SECTION - for /career-path-quiz TCDQ-42658
//============================================================

(function () {
    var entireQuiz = $('.js-career-quiz');

    //quiz outer panels
    var introPanel = entireQuiz.find('[data-panel="intro"]');
    var quizPanel = entireQuiz.find('[data-panel="quiz"]');
    var resultPanel = entireQuiz.find('[data-panel="result"]');

    var firstStart;

    //form buttons
    var startBtn = entireQuiz.find('.js-start-quiz');
    var nextBtn = quizPanel.find('.next-button');
    var submitBtn = quizPanel.find('.submit-button');
    var formRadios = quizPanel.find('[type="radio"]');

    // navigation buttons
    var navBtn = quizPanel.find('.nav-button');
    var navPrev = quizPanel.find('[data-change-slide="previous"]');
    var navNext = quizPanel.find('[data-change-slide="next"]');

    // this button has the slide change event bound to it
    var changeBtn = quizPanel.find('[data-change-slide]');

    //Page load actions
    //========================================================
    $('#remove-nojs').remove();
    var navBtnArr = $.makeArray(navBtn); // make array of navigation buttons
    var formFieldPanels = $.makeArray(quizPanel.find('[data-slide]')); // make array of form field slides and hide all of them except first one
    var firstQuestion = $(formFieldPanels[0]); //quiz starting question

    // hide all questions on page load
    $(formFieldPanels).each(function(){
        $(this).addClass('question-hidden');
    })


    // Quiz Button events
    //========================================================

    startBtn.on('click', startQuiz);

    changeBtn.on('click', function(e) {
        e.preventDefault()
        var newSlide = setSlide($(this), quizPanel.find('form').find('.current-question'));

        changeQuestion(newSlide);
    })

    submitBtn.on('click', function(e){
        e.preventDefault();
        endQuiz();
        setResults(calculateScore(quizPanel.find('form')));
    })

    formRadios.change(function(e){
        if(parseInt($(this).closest('.current-question').data('slide')) == (parseInt(nextBtn.attr('data-change-slide')-1))) {
            nextBtn.removeAttr('disabled');
        }

        if(parseInt($(this).closest('.current-question').attr('data-slide')) == formFieldPanels.length) {
            submitBtn.removeAttr('disabled');
        }
    })

    // Quiz functions
    //========================================================

    function startQuiz(){
        resetQuiz();

        // starting panel only displays once. This checks if it has already been removed or not.
        if(introNotRemoved(introPanel)){
            entireQuiz.css({
                height: introPanel.outerHeight()+"px",
            });
            introPanel.addClass('hidden');
        } else {
            entireQuiz.css({
                height: resultPanel.outerHeight()+"px",
            });
            resultPanel.addClass('hidden');
        }

        setTimeout(function(){
            entireQuiz.css({
                height: quizPanel.outerHeight()+$(formFieldPanels[0]).outerHeight()+"px"
            })
            quizPanel.addClass('visible').removeClass('hidden');
            setNavAnimation(firstQuestion.data('slide'), firstQuestion)
        }, 500);

        setTimeout(function(){
            changeQuestion(firstQuestion);

            entireQuiz.removeAttr('style').removeClass('quiz-ended');
        }, 1000);
    }

    function endQuiz(score){
        entireQuiz.css({
            height: quizPanel.outerHeight()+"px",
        });

        quizPanel.addClass('hidden').removeClass('visible');

        setTimeout(function(){
            entireQuiz.css({
                height: resultPanel.outerHeight()+"px"
            })
            resultPanel.addClass('visible').removeClass('hidden');
        }, 500);

        setTimeout(function(){
            entireQuiz.removeAttr('style').addClass('quiz-ended');
            $(formFieldPanels[$(formFieldPanels).length-1]).removeClass('current-question').addClass('question-hidden');
        }, 1000)
    }

    function changeQuestion(question){
        if(!question.hasClass('current-question')){
            var icons = question.find('img');
            var questionLegend = question.find('legend');
            var answer = question.find('fieldset').find('div');
            var animationDelay = 0;

            navBtn.removeClass('current-question');
            $('[data-change-slide="'+question.data('slide')+'"]').addClass('current-question');

            //reset slides and animations
            quizPanel.find('[data-slide]').removeClass('current-question').addClass('question-hidden');
            icons.removeClass();
            questionLegend.removeClass('animated');
            answer.removeClass('animated');

            //show new slide and focus
            question.addClass('current-question').removeClass('question-hidden').focus().hover();

            // start slide animation
            setTimeout(function(){
                questionLegend.addClass('animated');
                icons.each(function(){
                    var $this = $(this);
                    if($this.data('animate') == 'left'){
                        setTimeout(function(){
                            $this.addClass('bounceInLeft animated');
                        }, animationDelay);
                    } else if($this.data('animate') == 'right') {
                        setTimeout(function(){
                            $this.addClass('bounceInRight animated');
                        }, animationDelay);
                    } else {
                        setTimeout(function(){
                            $this.addClass('bounceIn animated');
                        }, animationDelay);
                    }
                    animationDelay+=500;
                });

                setTimeout(function(){
                    answer.addClass('animated');
                }, animationDelay);
            }, 200);

            if(parseInt(question.attr('data-slide')) == formFieldPanels.length) {
                nextBtn.attr('hidden', 'hidden');
                submitBtn.removeAttr('hidden').attr('disabled', 'disabled');
            }
        }
    }

    // this sets the slide that the user will be changing to
    function setSlide(trigger, question){
        var newSlide = question;
        var minNum = 1;
        var maxNum = formFieldPanels.length;
        var triggerValue = trigger.attr('data-change-slide');
        var currentSlideValue = parseInt(question.attr('data-slide'));

        if(parseInt(triggerValue)>=0){ //checks if trigger value is a number or not and converts to a number
            triggerValue = parseInt(triggerValue);
        } else {
            triggerValue = triggerValue=="previous" ? (parseInt(question.data('slide'))-1) : (parseInt(question.data('slide'))+1);
        }


        // do nothing if user selects current slide
        if(currentSlideValue!=triggerValue){
            newSlide = $('[data-slide="'+triggerValue+'"]'); //set new slide
            var newSlideValue = parseInt(newSlide.attr('data-slide'));

            // disable / enable NAV previous button
            newSlideValue<=minNum ? navPrev.attr('disabled', 'disabled') : navPrev.removeAttr('disabled');
            // disable / enable NAV next button
            (newSlideValue>=maxNum||newSlideValue>=(parseInt($('.next-button').attr('data-change-slide'))-1)) ? navNext.attr('disabled', 'disabled') : navNext.removeAttr('disabled');

            if(trigger.is('.next-button') && question.find('[type="radio"]').is(':checked')) {
                // disable the FORM next button and changes the progression value
                trigger.attr('disabled', 'disabled').blur().attr('data-change-slide', (newSlideValue+1));
                //animate nav progression bar
                setNavAnimation(newSlideValue, newSlide);
            }
        }

        return newSlide;
    }

    // this controls the navigation progression animation
    function setNavAnimation(slideNumber, question){
        var activeNav = $(quizPanel).find('.nav-button[data-change-slide="'+slideNumber+'"]');
        activeNav.addClass('activated').removeAttr('disabled');
    }

    function resetQuiz(){
        //resets all animations for quiz panel
        quizPanel.removeClass('visible').removeAttr('style');
        quizPanel.find('img').removeClass();
        quizPanel.find('.animated').removeClass('animated');
        quizPanel.find('form').trigger("reset");
        nextBtn.attr('data-change-slide', 2).attr('disabled', 'disabled').removeAttr('hidden');
        submitBtn.removeAttr('disabled').attr('hidden', 'hidden');
        navPrev.attr('disabled', 'disabled');
        navNext.attr('disabled', 'disabled');

        $(navBtnArr).each(function(){
            $(this).data('nav') == 1 ? $(this).addClass('activated').removeAttr('disabled') : $(this).removeClass('activated').attr('disabled', 'disabled');
        })

        setTimeout(function(){
            resultPanel.removeClass('visible').removeAttr('style');
        }, 600);
    }

    function calculateScore(form) {
        event.preventDefault();
        var answers = $(form).find('[type="radio"]:checked');
        var score = "";
        answers.each(function(){
            score+=$(this).val();
        })
        return score;
    }

    function setResults(score){ // this function was basically copied from the original quiz.. not completely sure how it works but it displays the results
        var resultLink;
        var resultTitle;
        var arr = ['12111', '11211', '11121', '21111' ,'12211','11111', '11221', '21211', '12112', '21121','11112', '11122', '11212', '22111', '21112','21221', '11222', '12221', '22221', '22121','12222', '12122', '22222', '21222', '21122', '22211', '21212', '22212', '22112'];
        var result = arr.indexOf(score);

        if(result<10){
            resultLink = '/link1';
            resultTitle = '[ analyst field services]';
        }
        else if(result>9 && result<16){
            resultLink = '/link2';
            resultTitle = '[analyst field services]';
        }
        else if(result>16 && result<29){
            resultLink = '/link2';
            resultTitle = '[ development field]'
        }

        $('#quiz-result-link').attr('href', resultLink)
        $('#quiz-result-title').text(resultTitle);
    }

    function introNotRemoved(panel){
        if(!panel.hasClass('hidden')){
            return true;
        }
        return false;
    }
})();