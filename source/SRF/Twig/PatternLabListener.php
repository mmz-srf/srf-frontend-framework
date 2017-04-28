<?php

namespace SRF\Twig;


use PatternLab\Data;
use PatternLab\Listener;
use PatternLab\PatternEngine\Twig\TwigUtil;

class PatternLabListener extends Listener {

    /**
     * Add the listeners for this plug-in
     */
    public function __construct() {

        $this->addListener("twigLoader.customize","addExtensions");

    }

    /**
     * Add the extensions to the appropriate instance
     */
    public function addExtensions() {

        $instance = TwigUtil::getInstance();
        $instance->addGlobal('frameworkAssetPath', '/assets');
    }

}
